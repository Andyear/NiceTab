import React, { useCallback, useState, memo, useRef } from 'react';
import { theme, Checkbox, Tooltip, Popover, Modal, QRCode } from 'antd';
import { CloseOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { GroupItem, TabItem } from '~/entrypoints/types';
import { getFaviconURL } from '~/entrypoints/common/utils';
import type { ModifierKeys } from '~/entrypoints/common/utils/click';
import { openNewTab } from '~/entrypoints/common/tabs';
import { settingsUtils } from '~/entrypoints/common/storage';
import { StyledActionIconBtn } from '~/entrypoints/common/style/Common.styled';
import { ENUM_COLORS, ENUM_SETTINGS_PROPS } from '~/entrypoints/common/constants';
import { eventEmitter, useIntlUtls } from '~/entrypoints/common/hooks/global';
import { getOSInfo } from '~/entrypoints/common/utils';
import {
  StyledTabItemWrapper,
  StyledTabTitle,
  StyledTabItemFavicon,
  StyledTabItemTooltip,
} from './TabListItem.styled';
import TabItemEditModal from './TabItemEditModal';

type TabItemProps = TabItem & {
  group: Pick<GroupItem, 'groupId' | 'isLocked' | 'isStarred'>;
  highlight?: boolean;
  onRemove?: (tabs: TabItem[]) => void;
  onChange?: (data: TabItem) => void;
};

const {
  DELETE_AFTER_RESTORE,
  CONFIRM_BEFORE_DELETING_TABS,
  SILENT_OPEN_TAB_MODIFIER_KEY,
  OPEN_TAB_MODIFIER_KEY,
  SHOW_TAB_TITLE_TOOLTIP,
} = ENUM_SETTINGS_PROPS;
const osInfo = getOSInfo();

// 标签页tooltip内容
const TabItemTooltipMarkup = memo(function TabItemTooltipMarkup({
  tab,
}: {
  tab: TabItem;
}) {
  const { $fmt } = useIntlUtls();
  return (
    <StyledTabItemTooltip>
      <div className="tooltip-item tooltip-title">
        <span className="label">{$fmt('common.name')}:</span>
        <span className="name" title={tab.title}>
          {tab.title}
        </span>
      </div>
      <div className="tooltip-item tooltip-url">
        <span className="label">{$fmt('common.url')}:</span>
        <a className="link" href={tab.url} target="_blank" title={tab.url}>
          {tab.url}
        </a>
      </div>
    </StyledTabItemTooltip>
  );
});

export default memo(function TabListItem({
  tabId,
  title,
  url,
  favIconUrl,
  group,
  highlight,
  onRemove,
  onChange,
}: TabItemProps) {
  const { token } = theme.useToken();
  const { $fmt } = useIntlUtls();
  const [removeModal, removeContextHolder] = Modal.useModal();
  const [tooltipSwitch, setTooltipSwitch] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const tabRef = useRef<HTMLDivElement>(null);

  const tab = useMemo(
    () => ({ tabId, title, url, favIconUrl }),
    [tabId, title, url, favIconUrl]
  );

  // 确认编辑
  const handleModalConfirm = useCallback(
    (newData: TabItem) => {
      onChange?.(newData);
      setModalVisible(false);
    },
    [onChange]
  );

  const handleTabRemove = useCallback(async () => {
    const settings = settingsUtils.settings || {};
    if (!settings[CONFIRM_BEFORE_DELETING_TABS]) {
      onRemove?.([tab]);
      return;
    }

    const removeDesc = $fmt({
      id: 'home.removeDesc',
      values: {
        type: `${$fmt(
          'home.tab'
        )}${` <div style="display: inline-flex; align-items: center; font-weight: bold;">
          [<strong style="display: inline-block; max-width: 280px" class="ellipsis">
            ${tab.title}</strong>
          ]</div>
        `}`,
      },
    });
    const confirmed = await removeModal.confirm({
      title: $fmt('home.removeTitle'),
      content: <div dangerouslySetInnerHTML={{ __html: removeDesc }}></div>,
    });
    console.log('tab-remove-confirmed', confirmed);
    if (confirmed) {
      onRemove?.([tab]);
    }
  }, [$fmt, tab, onRemove]);

  // 执行打开标签页
  const handleTabOpen = useCallback(
    (active: boolean) => {
      const settings = settingsUtils.settings;
      // 如果直接单击未按下alt键，则打开新标签页并激活(active: true)，如果按下了alt键，则后台静默打开新标签页(active: false)
      openNewTab(tab.url, { active });

      if (settings[DELETE_AFTER_RESTORE] && !group?.isLocked) {
        onRemove?.([tab]);
      }
      setTooltipVisible(false);
    },
    [tab, group.isLocked, onRemove]
  );

  // 鼠标点击标签页
  const onTabOpen = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const settings = settingsUtils.settings;
      let silentModifierKey = settings[SILENT_OPEN_TAB_MODIFIER_KEY] || '';
      let defaultModifierKey = settings[OPEN_TAB_MODIFIER_KEY] || '';
      if (silentModifierKey === 'cmdOrCtrl') {
        silentModifierKey = osInfo.isMac ? 'meta' : 'ctrl';
      }
      if (defaultModifierKey === 'cmdOrCtrl') {
        defaultModifierKey = osInfo.isMac ? 'meta' : 'ctrl';
      }

      const defaultFlag = event?.[`${defaultModifierKey as ModifierKeys}Key`];
      const silentFlag = event?.[`${silentModifierKey as ModifierKeys}Key`];

      // 前台打开方式优先级高于静默打开方式
      if (defaultModifierKey && defaultFlag) {
        handleTabOpen(true);
      } else if (silentModifierKey && silentFlag) {
        handleTabOpen(false);
      } else if (!defaultModifierKey) {
        handleTabOpen(true);
      } else if (!silentModifierKey) {
        handleTabOpen(false);
      } else {
        // 兜底使用前台打开方式 (正常不会走到这一步)
        handleTabOpen(true);
      }
    },
    [handleTabOpen]
  );

  const draggingListener = (value: boolean) => {
    setIsDragging(value);
    if (value) setTooltipVisible(false);
  };

  const scrollToTab = useCallback(() => {
    if (highlight && tabRef.current) {
      setTimeout(() => {
        tabRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlight]);
  useEffect(() => {
    scrollToTab();
  }, []);

  useEffect(() => {
    const _toolTipswitch = !!settingsUtils?.settings?.[SHOW_TAB_TITLE_TOOLTIP];
    setTooltipSwitch(_toolTipswitch);
    if (_toolTipswitch) {
      eventEmitter.on('home:is-dragging', draggingListener);
    }
    return () => {
      eventEmitter.off('home:is-dragging', draggingListener);
    };
  }, []);

  return (
    <>
      <StyledTabItemWrapper
        className="tab-list-item"
        ref={tabRef}
        $bgColor={highlight ? token.colorWarningHover : ''}
      >
        {/* checkbox */}
        {!group?.isLocked && (
          <Checkbox className="checkbox-item" value={tab.tabId}></Checkbox>
        )}
        {/* icon tab qrcode */}
        {tab.url && (
          <Popover
            color="#fbfbfb"
            destroyTooltipOnHide
            trigger="click"
            content={<QRCode value={tab.url} color="#000" bordered={false} />}
          >
            <StyledActionIconBtn
              className="tab-item-btn btn-qrcode"
              $size="16"
              title={$fmt('common.qrcode')}
              $hoverColor={token.colorPrimary}
            >
              <QrcodeOutlined />
            </StyledActionIconBtn>
          </Popover>
        )}
        {/* icon tab edit */}
        <StyledActionIconBtn
          className="tab-item-btn btn-edit"
          $size="16"
          title={$fmt('common.edit')}
          $hoverColor={token.colorPrimary}
          onClick={() => setModalVisible(true)}
        >
          <EditOutlined />
        </StyledActionIconBtn>
        {/* icon tab remove */}
        {!group?.isLocked && (
          <StyledActionIconBtn
            className="tab-item-btn btn-remove"
            $size="16"
            title={$fmt('common.remove')}
            $hoverColor={ENUM_COLORS.red}
            onClick={handleTabRemove}
          >
            <CloseOutlined />
          </StyledActionIconBtn>
        )}
        {/* icon tab favicon */}
        <StyledTabItemFavicon
          className="tab-item-favicon"
          $bgUrl={tab.favIconUrl || getFaviconURL(tab.url!)}
        />
        {/* tab title */}
        <StyledTabTitle className="tab-item-title">
          {tooltipSwitch ? (
            <Tooltip
              open={!isDragging && tooltipVisible}
              placement="topLeft"
              styles={{ root: { maxWidth: '360px', width: '360px' } }}
              title={<TabItemTooltipMarkup tab={tab} />}
              color={token.colorBgElevated}
              destroyTooltipOnHide
              mouseEnterDelay={0.4}
              mouseLeaveDelay={0.3}
              onOpenChange={setTooltipVisible}
            >
              <a className="link" href={tab.url} draggable={false} onClick={onTabOpen}>
                {tab.title}
              </a>
            </Tooltip>
          ) : (
            <a
              className="link"
              href={tab.url}
              title={tab.title}
              draggable={false}
              onClick={onTabOpen}
            >
              {tab.title}
            </a>
          )}
        </StyledTabTitle>
      </StyledTabItemWrapper>

      {/* 删除确认弹窗holder */}
      {removeContextHolder}

      {modalVisible && (
        <TabItemEditModal
          data={tab}
          visible={modalVisible}
          onOk={handleModalConfirm}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </>
  );
});
