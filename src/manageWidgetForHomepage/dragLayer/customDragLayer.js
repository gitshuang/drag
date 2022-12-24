import React, { Component } from 'react';
import { DragLayer } from 'react-dnd';
import CardListDragPreview from './cardListDragPreview';
import {desk_setting_layer} from './style.css'

@DragLayer((monitor) => {
   return {
	item: monitor.getItem(),
	itemType: monitor.getItemType(),
	currentOffset: monitor.getSourceClientOffset(),
	clientOffset: monitor.getClientOffset(),
	isDragging: monitor.isDragging()
}
})
//拖拽的layer组件类
export default class CustomDragLayer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			layerStyle: { display: 'none' }
		};

	}
	//如果是item类型，返回preview组件
	renderItem(type, item) {
		switch (type) {
			case 'item':
				if (item.cardList) {
					return <CardListDragPreview cardListLength={item.cardList.length} />;
				} else {
					return null;
				}

			default:
				return null;
		}
	}

	componentWillUnmount() {
		cancelAnimationFrame(this.requestedFrame);
	}

	getMyItemStyles() {
		requestAnimationFrame(this.getItemStyles);
	}

	getItemStyles = () => {
		const { clientOffset } = this.props;

		if (!clientOffset) {
			return {
				display: 'none'
			};
		}
		let { x, y } = clientOffset;
		const transform = `translate(${x}px, ${y}px)`;
		return {
			transform,
			WebkitTransform: transform
		};
	};
    
	shouldComponentUpdate(nextProps, nextState) {
		const thisProps = this.props || {},
			thisState = this.state || {};
		if (this.props.item && this.props.item.type === 'cardList' && this.props.isDragging !== nextProps.isDragging) {
			return true;
		}
		if (
			this.props.item &&
			this.props.item.type === 'cardList' &&
			this.props.currentOffset !== nextProps.currentOffset
		) {
			//如果两次移动的直线距离大于1.5px
			if (
				nextProps.currentOffset &&
				Math.pow(
					Math.pow(this.props.clientOffset.x - nextProps.clientOffset.x, 2) +
						Math.pow(this.props.clientOffset.y - nextProps.clientOffset.y, 2),
					0.5
				) > 1.5
			) {
				return true;
			}
		}
		return false;
	}
	render() {
		const { item, itemType, isDragging } = this.props;
		if (!isDragging || item.type !== 'cardList') {
			return null;
		}
		//IE浏览器去掉拖拽预览
		if (navigator.userAgent.indexOf('MSIE') > -1 || 
			navigator.userAgent.indexOf('Trident') > -1 ||
			navigator.userAgent.indexOf('Edge') > -1) {
			return null;
		}

		return (
			<div className={desk_setting_layer}>
				<div style={this.getItemStyles()}>{this.renderItem(itemType, item)}</div>
			</div>
		);
	}
}
