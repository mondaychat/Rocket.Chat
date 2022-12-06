import { VideoAttachmentProps } from '@rocket.chat/core-typings';
import { Box, MessageGenericPreview } from '@rocket.chat/fuselage';
import { useMediaUrl } from '@rocket.chat/ui-contexts';
import React, { FC } from 'react';

import MarkdownText from '../../../../../../components/MarkdownText';
import { userAgentMIMETypeFallback } from '../../../../../../lib/utils/userAgentMIMETypeFallback';
import MessageCollapsible from '../../MessageCollapsible';
import MessageContentBody from '../../MessageContentBody';

export const VideoAttachment: FC<VideoAttachmentProps> = ({
	title,
	video_url: url,
	video_type: type,
	video_size: size,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
}) => {
	const getURL = useMediaUrl();

	return (
		<>
			{descriptionMd ? <MessageContentBody md={descriptionMd} /> : <MarkdownText parseEmoji content={description} />}
			<MessageCollapsible title={title} hasDownload={hasDownload} link={getURL(link || url)} size={size}>
				<MessageGenericPreview style={{ maxWidth: 368, width: '100%' }}>
					<Box is='video' controls preload='metadata'>
						<source src={getURL(url)} type={userAgentMIMETypeFallback(type)} />
					</Box>
				</MessageGenericPreview>
			</MessageCollapsible>
		</>
	);
};
