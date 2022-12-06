import { isFileAttachment, FileProp, MessageAttachmentBase, isQuoteAttachment } from '@rocket.chat/core-typings';
import React, { memo, ReactElement } from 'react';

import { FileAttachment } from '../../../views/room/MessageList/components/Attachments/Files/FileAttachment';
import DefaultAttachment from './DefaultAttachment';
import { QuoteAttachment } from './QuoteAttachment';

type AttachmentsItemProps = {
	file?: FileProp;
	attachment: MessageAttachmentBase;
};

const Item = ({ attachment, file }: AttachmentsItemProps): ReactElement => {
	if (isFileAttachment(attachment) && file) {
		return <FileAttachment {...attachment} file={file} />;
	}

	if (isQuoteAttachment(attachment)) {
		return <QuoteAttachment attachment={attachment} />;
	}

	return <DefaultAttachment {...(attachment as any)} />;
};

export default memo(Item);
