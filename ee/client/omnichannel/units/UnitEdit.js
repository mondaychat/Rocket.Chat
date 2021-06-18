import {
	Field,
	TextInput,
	Button,
	Box,
	PaginatedMultiSelectFiltered,
	Select,
	Margins,
} from '@rocket.chat/fuselage';
import { useMutableCallback, useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import React, { useMemo, useState } from 'react';

import VerticalBar from '../../../../client/components/VerticalBar';
import { useRoute } from '../../../../client/contexts/RouterContext';
import { useMethod } from '../../../../client/contexts/ServerContext';
import { useToastMessageDispatch } from '../../../../client/contexts/ToastMessagesContext';
import { useTranslation } from '../../../../client/contexts/TranslationContext';
import { useRecordList } from '../../../../client/hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../client/hooks/useAsyncState';
import { useForm } from '../../../../client/hooks/useForm';
import { useDepartmentsByUnitsList } from '../../../../client/views/hooks/useDepartmentsByUnitsList';
import { useMonitorsList } from '../../../../client/views/hooks/useMonitorsList';

function UnitEdit({ data, unitId, isNew, unitMonitors, unitDepartments, reload, ...props }) {
	const t = useTranslation();
	const unitsRoute = useRoute('omnichannel-units');
	const [monitorsFilter, setMonitorsFilter] = useState('');
	const [departmentsFilter, setDepartmentsFilter] = useState('');

	const debouncedDepartmentsFilter = useDebouncedValue(departmentsFilter, 500);

	const { itemsList: monitorsList, loadMoreItems: loadMoreMonitors } = useMonitorsList(
		useMemo(() => ({ filter: monitorsFilter }), [monitorsFilter]),
	);

	const { phase: monitorsPhase, items: monitorsItems, itemCount: monitorsTotal } = useRecordList(
		monitorsList,
	);

	const {
		itemsList: departmentsList,
		loadMoreItems: loadMoreDepartments,
	} = useDepartmentsByUnitsList(
		useMemo(() => ({ filter: debouncedDepartmentsFilter, unitId }), [
			debouncedDepartmentsFilter,
			unitId,
		]),
	);

	const {
		phase: departmentsPhase,
		items: departmentsItems,
		itemCount: departmentsTotal,
	} = useRecordList(departmentsList);

	const unit = data || {};

	const currUnitMonitors = useMemo(
		() =>
			unitMonitors && unitMonitors.monitors
				? unitMonitors.monitors.map(({ monitorId, username }) => ({
						value: monitorId,
						label: username,
				  }))
				: [],
		[unitMonitors],
	);
	const visibilityOpts = [
		['public', t('Public')],
		['private', t('Private')],
	];

	const currUnitDepartments = useMemo(
		() =>
			unitDepartments && unitDepartments.departments && unitId
				? unitDepartments.departments.map(({ _id, name }) => ({
						value: _id,
						label: name,
				  }))
				: [],
		[unitDepartments, unitId],
	);

	const { values, handlers, hasUnsavedChanges } = useForm({
		name: unit.name,
		visibility: unit.visibility,
		departments: currUnitDepartments,
		monitors: currUnitMonitors,
	});

	const { handleName, handleVisibility, handleDepartments, handleMonitors } = handlers;
	const { name, visibility, departments, monitors } = values;

	const nameError = useMemo(
		() => (!name || name.length === 0 ? t('The_field_is_required', t('name')) : undefined),
		[name, t],
	);
	const visibilityError = useMemo(
		() =>
			!visibility || visibility.length === 0
				? t('The_field_is_required', t('description'))
				: undefined,
		[visibility, t],
	);
	const departmentError = useMemo(
		() =>
			!departments || departments.length === 0
				? t('The_field_is_required', t('departments'))
				: undefined,
		[departments, t],
	);
	const unitMonitorsError = useMemo(
		() =>
			!monitors || monitors.length === 0 ? t('The_field_is_required', t('monitors')) : undefined,
		[monitors, t],
	);

	const saveUnit = useMethod('livechat:saveUnit');

	const dispatchToastMessage = useToastMessageDispatch();

	const handleReset = useMutableCallback(() => {
		reload();
	});

	const canSave = useMemo(
		() => !nameError && !visibilityError && !departmentError && !unitMonitorsError,
		[nameError, visibilityError, departmentError, unitMonitorsError],
	);

	const handleSave = useMutableCallback(async () => {
		const unitData = { name, visibility };
		const departmentsData = departments.map((department) => ({ departmentId: department.value }));
		const monitorsData = monitors.map((monitor) => ({
			monitorId: monitor.value,
			username: monitor.label,
		}));

		if (!canSave) {
			return dispatchToastMessage({ type: 'error', message: t('The_field_is_required') });
		}

		try {
			await saveUnit(unitId, unitData, monitorsData, departmentsData);
			dispatchToastMessage({ type: 'success', message: t('Saved') });
			reload();
			unitsRoute.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	return (
		<VerticalBar.ScrollableContent is='form' {...props}>
			<Field>
				<Field.Label>{t('Name')}*</Field.Label>
				<Field.Row>
					<TextInput
						placeholder={t('Name')}
						flexGrow={1}
						value={name}
						onChange={handleName}
						error={hasUnsavedChanges && nameError}
					/>
				</Field.Row>
			</Field>
			<Field>
				<Field.Label>{t('Visibility')}*</Field.Label>
				<Field.Row>
					<Select
						options={visibilityOpts}
						value={visibility}
						error={hasUnsavedChanges && visibilityError}
						placeholder={t('Select_an_option')}
						onChange={handleVisibility}
						flexGrow={1}
					/>
				</Field.Row>
			</Field>
			<Field>
				<Field.Label>{t('Departments')}*</Field.Label>
				<Field.Row>
					<PaginatedMultiSelectFiltered
						filter={departmentsFilter}
						setFilter={setDepartmentsFilter}
						options={departmentsItems}
						value={departments}
						error={hasUnsavedChanges && departmentError}
						maxWidth='100%'
						placeholder={t('Select_an_option')}
						onChange={handleDepartments}
						flexGrow={1}
						endReached={
							departmentsPhase === AsyncStatePhase.LOADING
								? () => {}
								: (start) => loadMoreDepartments(start, Math.min(50, departmentsTotal))
						}
					/>
				</Field.Row>
			</Field>
			<Field>
				<Field.Label>{t('Monitors')}*</Field.Label>
				<Field.Row>
					<PaginatedMultiSelectFiltered
						filter={monitorsFilter}
						setFilter={setMonitorsFilter}
						options={monitorsItems}
						value={monitors}
						error={hasUnsavedChanges && unitMonitorsError}
						maxWidth='100%'
						placeholder={t('Select_an_option')}
						onChange={handleMonitors}
						flexGrow={1}
						endReached={
							monitorsPhase === AsyncStatePhase.LOADING
								? () => {}
								: (start) => loadMoreMonitors(start, Math.min(50, monitorsTotal))
						}
					/>
				</Field.Row>
			</Field>

			<Field.Row>
				<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
					<Margins inlineEnd='x4'>
						{!isNew && (
							<Button flexGrow={1} type='reset' disabled={!hasUnsavedChanges} onClick={handleReset}>
								{t('Reset')}
							</Button>
						)}
						<Button
							primary
							mie='none'
							flexGrow={1}
							disabled={!hasUnsavedChanges || !canSave}
							onClick={handleSave}
						>
							{t('Save')}
						</Button>
					</Margins>
				</Box>
			</Field.Row>
		</VerticalBar.ScrollableContent>
	);
}

export default UnitEdit;
