import React from 'react';
import Card from './card';
import classNames from 'classnames';



export default class CardsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: true
        }
    }
    handleClick = () => {
        this.setState({
            isShow: !this.state.isShow
        })
    }
    componentDidMount() {

        const height = this.listDom.offsetHeight;
        this.setState({
            height: height
        })
    }
    render() {
        const { list, listName, onChangeChecked, checkedCardList } = this.props;
        const { isShow, height } = this.state;
        const showStyle = isShow ? {
            height: height
        } : {
                height: 0,
            }
        list.forEach(element => {
            const isContainInCheckCardList = checkedCardList.some(a => { return a.templateCode == element.templateCode })

            element.checked = isContainInCheckCardList
        });
        return <div style={{ width: "100%" }}>
            <div className="serviceTitle"><span>{listName}</span>
            {list.length?<i className={classNames({ down: isShow })} onClick={this.handleClick} />:null}
            </div>
            <div className="result_app_list_4" style={{ ...showStyle, transition: "height .5s" }} ref={ref => this.listDom = ref}>
                {list.map((item, c) => {

                    return <Card data={JSON.parse(JSON.stringify(item))}
                        key={`${item.widgettemplateId}-${c}`} 
                        index={c}
                        onChangeChecked={onChangeChecked}
                        checkedCardList={checkedCardList}
                    />//{item.menuItemName}

                })}
            </div>
            <hr />
        </div>
    }
}