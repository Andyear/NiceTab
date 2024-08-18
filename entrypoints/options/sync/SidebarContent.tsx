import { useCallback, useMemo } from 'react';
import { theme, Flex, Card, Tooltip, Typography, Tag } from 'antd';
import {
  SettingOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type {
  SyncRemoteType,
  SyncConfigItemProps,
  SyncConfigProps,
  SyncStatus,
  SyncStatusProps,
  SyncResultItemProps,
  SyncResultProps,
} from '~/entrypoints/types';
import { classNames } from '~/entrypoints/common/utils';
import { useIntlUtls } from '~/entrypoints/common/hooks/global';
import { syncTypeMap } from '~/entrypoints/common/constants';
import type { RemoteOptionProps } from './types';
import { remoteOptions } from './constants';
import { StyledLabel } from './Sync.styled';
import { useSyncResult } from './hooks';

type CardItemProps = {
  option: RemoteOptionProps;
  isActive?: boolean;
  syncConfig: SyncConfigItemProps;
  syncStatus: SyncStatus;
  syncResult: SyncResultItemProps[];
  onAction?: (option: RemoteOptionProps, actionType: string) => void;
};

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .card-title {
    font-weight: bold;
    font-weight: 600;
    font-size: 18px;
  }
`;

function CardItemMarkup({
  option,
  isActive,
  syncConfig,
  syncStatus,
  syncResult,
  onAction,
}: CardItemProps) {
  const { $fmt } = useIntlUtls();
  const lastSyncInfo = useMemo(() => {
    return syncResult?.[0] || {};
  }, [syncResult]);

  const { syncTypeText, syncTypeTipText, variantInfo } = useSyncResult(lastSyncInfo);

  const cardTitle = useMemo(() => {
    return (
      <StyledTitle>
        <div className="card-title">{option.label}</div>
        {syncConfig?.accessToken ? (
          syncStatus === 'syncing' ? (
            <Tag icon={<SyncOutlined spin />} color="processing">
              {$fmt('sync.syncing')}
            </Tag>
          ) : null
        ) : (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            {$fmt('sync.noAccessToken')}
          </Tag>
        )}
      </StyledTitle>
    );
  }, [option, syncConfig, syncStatus]);

  const description = useMemo(() => {
    return (
      <Flex vertical gap={6}>
        <Typography.Text type="secondary">
          <StyledLabel>{$fmt('sync.lastSyncTime')}: </StyledLabel>
          {lastSyncInfo?.syncTime || $fmt('common.noData')}
        </Typography.Text>
        {lastSyncInfo?.syncTime && lastSyncInfo?.syncType && (
          <>
            <Typography.Text type="secondary">
              <StyledLabel>{$fmt('sync.lastSyncType')}: </StyledLabel>
              <Tooltip
                color="#fff"
                destroyTooltipOnHide
                title={<Typography.Text>{syncTypeTipText}</Typography.Text>}
              >
                <Tag color="blue">{syncTypeText}</Tag>
              </Tooltip>
            </Typography.Text>
            <Typography.Text type="secondary">
              <StyledLabel>{$fmt('sync.lastSyncResult')}: </StyledLabel>
              <Tag color={variantInfo.variant}>{variantInfo.text}</Tag>
            </Typography.Text>
            {lastSyncInfo.reason && (
              <Typography.Text type="danger">
                <StyledLabel>{$fmt('common.failedReason')}: </StyledLabel>
                {lastSyncInfo.reason}
              </Typography.Text>
            )}
          </>
        )}
      </Flex>
    );
  }, [lastSyncInfo, syncTypeText, syncTypeTipText, variantInfo]);

  const actions = useMemo(() => {
    return [
      <Tooltip
        color="#fff"
        destroyTooltipOnHide
        title={<Typography.Text>{$fmt('common.settings')}</Typography.Text>}
      >
        <div className="icon-btn-wrapper" onClick={() => onAction?.(option, 'setting')}>
          <SettingOutlined key="setting" />
        </div>
      </Tooltip>,
      <Tooltip
        color="#fff"
        destroyTooltipOnHide
        title={<Typography.Text>{$fmt('sync.tip.manualPullForce')}</Typography.Text>}
      >
        <div
          className="icon-btn-wrapper"
          onClick={() => onAction?.(option, syncTypeMap['MANUAL_PULL_FORCE'])}
        >
          <CloudDownloadOutlined key={syncTypeMap['MANUAL_PULL_FORCE']} />
        </div>
      </Tooltip>,
      <Tooltip
        color="#fff"
        destroyTooltipOnHide
        title={<Typography.Text>{$fmt('sync.tip.manualPushMerge')}</Typography.Text>}
      >
        <div
          className="icon-btn-wrapper"
          onClick={() => onAction?.(option, syncTypeMap['MANUAL_PUSH_MERGE'])}
        >
          <SyncOutlined key={syncTypeMap['MANUAL_PUSH_MERGE']} />
        </div>
      </Tooltip>,
      <Tooltip
        color="#fff"
        destroyTooltipOnHide
        title={<Typography.Text>{$fmt('sync.tip.manualPushForce')}</Typography.Text>}
      >
        <div
          className="icon-btn-wrapper"
          onClick={() => onAction?.(option, syncTypeMap['MANUAL_PUSH_FORCE'])}
        >
          <CloudUploadOutlined key={syncTypeMap['MANUAL_PUSH_FORCE']} />
        </div>
      </Tooltip>,
    ]
  }, [option, onAction]);

  return (
    <Card
      className={classNames('card-item', isActive && 'active')}
      hoverable
      classNames={{
        actions: 'card-actions',
      }}
      onClick={() => onAction?.(option, 'select')}
      actions={actions}
    >
      <Card.Meta title={cardTitle} description={description} />
    </Card>
  );
}

const StyledCard = styled.div<{ $primaryColor: string }>`
  .card-item {
    &.active {
      border-color: ${(props) => props.$primaryColor};
    }
    .icon-btn-wrapper {
      padding: 4px;
    }
  }
`;


type SideBarContentProps = {
  selectedKey?: string;
  syncConfig: SyncConfigProps;
  syncStatus: SyncStatusProps;
  syncResult: SyncResultProps;
  onAction?: (option: RemoteOptionProps, actionType: string) => void;
};

export default function SidebarContent({
  selectedKey,
  syncConfig,
  syncStatus,
  syncResult,
  onAction,
}: SideBarContentProps) {
  const { token } = theme.useToken();

  const handleAction = useCallback(
    (option: RemoteOptionProps, actionType: string) => {
      onAction?.(option, actionType);
    },
    [onAction]
  );

  return (
    <Flex vertical gap={12}>
      {remoteOptions.map((option) => (
        <StyledCard key={option.key} $primaryColor={token.colorPrimary}>
          <CardItemMarkup
            option={option}
            isActive={selectedKey === option.key}
            syncConfig={syncConfig?.[option.key] || {}}
            syncStatus={syncStatus?.[option.key] || {}}
            syncResult={syncResult?.[option.key] || []}
            onAction={handleAction}
          ></CardItemMarkup>
        </StyledCard>
      ))}
    </Flex>
  );
}
