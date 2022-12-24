import React, { Component } from 'react';
import { DragSource } from 'react-dnd';

import { compactLayoutHorizontal } from '../compact';
import * as utilService from '../utils';
import _ from 'lodash';
import { card_shadow, card, card_mid, card_footer } from "./style.css"
import Icon from 'pub-comp/icon';
import { IS_IE } from '../utils';


import { connect } from 'react-redux';
import { mapStateToProps } from '../../utils';
import manageActions from '../core/action';
const { updateShadowCard, updateGroupList } = manageActions;


const noteSource = {
	//开始拖拽，设置isShadow属性，shadowCard对象，更新groups
	beginDrag(props, monitor, component) {
		const dragCard = utilService.getCardByGroupIDAndCardID(props.manageList, props.groupID, props.id);
		dragCard.isShadow = true;
		props.updateShadowCard(dragCard);
		return { id: props.id, type: props.type };

	},
	//结束拖拽，设置isShadow属性，shadowCard对象，更新groups
	endDrag(props, monitor, component) {
		//判断是否正常走了drop事件
		if (!monitor.didDrop()) {
			let { manageList } = props;
			manageList = _.cloneDeep(manageList);
			utilService.setPropertyValueForCards(manageList, 'isShadow', false);
			props.updateShadowCard({});
			props.updateGroupList(manageList);
		}
	}
};

@connect(
	mapStateToProps(
		"manageList",
		"shadowCard",
		"layout",
		{
			namespace: 'managewidget',
		},
	), {
		updateShadowCard,
		updateGroupList,
	}
)
@DragSource('item', noteSource, (connect) => ({
	connectDragSource: connect.dragSource()
}))
//卡片组件类
export default class Item extends Component {
	constructor(props) {
		super(props);
	}
	//依靠前后props中shadowCard状态（前为空对象，后为有对象）来判断是否为beginDrag状态，来阻止dom刷新
	shouldComponentUpdate(nextProps, nextState) {
		const thisProps = this.props || {},
			thisState = this.state || {};
		if (this.props.isChecked !== nextProps.isChecked) {
			return true;
		}
		//全等判断值为false，使用isEqual判断
		if (!_.isEqual(this.props.layout, nextProps.layout)) {
			return true;
		}
		if (this.props.gridx !== nextProps.gridx || this.props.gridy !== nextProps.gridy) {
			return true;
		}
		if (this.props.isShadow !== nextProps.isShadow) {
			return true;
		}

		return false;
	}
	//删除卡片
	deleteCard = () => {
		let { manageList, groupIndex } = this.props;
		manageList = _.cloneDeep(manageList);
		utilService.removeCardByGroupIndexAndCardID(manageList, groupIndex, this.props.id);

		let compactedLayout = compactLayoutHorizontal(manageList[groupIndex].children, this.props.layout.col);
		manageList[groupIndex].children = compactedLayout;
		this.props.updateGroupList({ manageList, isEdit: true });
	};
	//选中卡片
	onCheckboxChange = (flag) => {
		let { manageList, groupIndex, index } = this.props;
		manageList = _.cloneDeep(manageList);
		manageList[groupIndex].children[index].isChecked = flag;
		this.props.updateGroupList(manageList);
	};
	render() {
		const {
			connectDragSource,
			name,
			gridx,
			gridy,
			width,
			height,
			isShadow,
			isChecked,
			haspower
		} = this.props;

		const { margin, rowHeight, calWidth } = this.props.layout;

		const { x, y } = utilService.calGridItemPosition(gridx, gridy, margin, rowHeight, calWidth);


		const { wPx, hPx } = utilService.calWHtoPx(width, height, margin, rowHeight, calWidth);
		let cardDom;
		//是否为拖拽中的阴影卡片
		if (isShadow) {
			cardDom = (
				<div
					className={card_shadow}
					style={{
						width: wPx,
						height: hPx,
						transform: `translate(${x}px, ${y}px)`
					}}
				>

					<div  className="cardTitle">{name}</div>
				
					<div className={card_footer}>
						{/* <Checkbox checked={isChecked} onChange={this.onCheckboxChange} /> */}
						<Icon type='dustbin' className='card-delete' onClick={this.deleteCard} />
						
					</div>

				</div>
			);
		} else {
			const opacity = haspower === false ? 0.6 : 1;
			cardDom = (
				<div
					className={card}
					style={{
						width: wPx,
						height: hPx,
						opacity: opacity,
						transform: `translate(${x}px, ${y}px)`
					}}
				>
					<div className="cardTitle">{name}</div>
					<div className={card_mid}>

					</div>
					<div className={`${IS_IE?"ie11":''} ${card_footer}`}>
						{/* <Checkbox checked={isChecked} onChange={this.onCheckboxChange} /> */}
						<Icon type='dustbin' className='card-delete' onClick={this.deleteCard} />
					</div>
				</div>
			);
		}
		return connectDragSource(cardDom);
	}
}


