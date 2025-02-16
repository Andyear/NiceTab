import { useCallback, useState, memo, useRef } from 'react';
import { theme, Checkbox, Typography, Tooltip, Popover, Modal, QRCode } from 'antd';
import { CloseOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { GroupItem, TabItem } from '~/entrypoints/types';
import { getFaviconURL } from '~/entrypoints/common/utils';
import clickDecorator from '~/entrypoints/common/utils/click';
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
        {/* <span className="link" title={tab.url}>
          {tab.url}
        </span> */}
        <Typography.Link className="link" href={tab.url} target="_blank" title={tab.url}>
          {tab.url}
        </Typography.Link>
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

  // 点击打开标签页
  const onTabOpen = useMemo(() => {
    const settings = settingsUtils.settings;
    let modifierKey = settings[SILENT_OPEN_TAB_MODIFIER_KEY] || 'alt';
    if (modifierKey === 'cmdOrCtrl') {
      modifierKey = osInfo.isMac ? 'meta' : 'ctrl';
    }

    return clickDecorator(
      ({ isMatched }) => {
        // 如果直接单击未按下alt键，则打开新标签页并激活(active: true)，如果按下了alt键，则后台静默打开新标签页(active: false)
        openNewTab(tab.url, { active: !isMatched });
        setTimeout(() => {
          if (settings[DELETE_AFTER_RESTORE] && !group?.isLocked) {
            onRemove?.([tab]);
          }
          setTooltipVisible(false);
        }, 500);
      },
      { allowMissMatch: true, [modifierKey]: true }
    );
  }, [tab, group.isLocked, onRemove]);

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
    eventEmitter.on('home:is-dragging', draggingListener);
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
        <StyledTabTitle
          className="tab-item-title"
          $color={token.colorLink}
          $colorHover={token.colorLinkHover}
        >
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
            <span className="tab-item-title-text" onClick={onTabOpen}>
              {tab.title}
            </span>
          </Tooltip>
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
