import React, { Component } from 'react';
import ButtonGroup from 'bee/button-group';
import Button from 'bee/button';
import ServiceItem from '../serviceItem';
import SearchInput from '../../searchInput';
import { ButtonBrand, ButtonDefaultAlpha } from '../../button';
import { guid } from '../../utils';


import {
  select_widget_list,
  widget_right, 
  panel, left, panel_right,
  panel_left, footer_btn, btn_active, btn_type, server_type
} from './style.css'

class SelectWidgetList extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      data: {},//接口全部数据
      applications: [],
      value: "",
      edit: false
    })
  }

  componentDidMount() {
    this.getServices();
  }

  getServices() {
    const {  getAllServicesByLabelGroup, languagesJSON } = this.props;
    getAllServicesByLabelGroup().then(({ error, payload }) => {
      if (error) {
        //requestError(payload);
      }    
      const { labelGroups } = payload;
      labelGroups.forEach((da, i) => {
        i === 0 ? da.active = true : da.active = false;
        const { labels } = da;
        labels.splice(0, 0, { labelName: languagesJSON.all, labelId: "all", active: true });
      });
      this.setState({
        data: payload,
        applications: payload.applications
      })
      //requestSuccess();
    });
  }

  btnSearch = () => {
    const { data: { applications } } = this.state;
    let { value } = this.state;
    let _applications = [];
    if (value == "") {
      _applications = applications;
    } else {
      value = value.trim();
      _applications = this.getSearch(applications, value);
    }
    this.setState({
      applications: _applications
    })
  }

  getSearch = (applications, value) => {
    var result = [];
    applications.forEach((da) => {
      var _name = da.applicationName || da.serviceName;
      if (_name.indexOf(value) != -1) {
        const data = { ...da };
        if (da.service && da.service.length > 0) {
          data.service = this.getSearch(da.service, value);
        }
        result.push(data);
      } else {  // TODO 在原来基础上增加 父级不对应  子集对应的方法    有点low  后续有时间改进
        if (da.service && da.service.length > 0) {
          var data = { ...da };
          data.service = [];
          var flag = false;
          da.service.forEach(function (item) {
            if (item.serviceName.indexOf(value) != -1) {
              flag = true;
              data.service.push(item);
            }
          });
          if (flag) {
            result.push(data);
          }
        }
      }
    });
    return result;
  }

  onChange = (data, sele) => {
    const { applications } = this.state;
    let selectObj = null;
    if (data.widgetTemplate.serviceType == "1") {//服务
      selectObj = applications.find((da) => da.applicationId == data.applicationId);
      let _service = selectObj.service.find((da) => da.serviceId == data.serviceId);
      _service.selected = sele;
    }
    if (data.widgetTemplate.serviceType == "2") {//应用
      selectObj = applications.find((da) => da.applicationId == data.applicationId);
      selectObj.selected = sele;
    }

    let _edit = false;
    applications.forEach((da, index) => {
      if (da.selected == "3") {
        _edit = true;
      } else {
        if (da.service.length == 0) return;
        let _ser = da.service.find((_da) => _da.selected == "3");
        if (_ser) {
          _edit = true;
        }
      }
    })
    this.setState({
      ...this.state,
      edit: _edit
    });
  }

  //输入框修改data数据源
  inputOnChange = (e) => {
    this.setState({
      value: e
    });
  }

  btnSave = () => {
    const { applications } = this.state;
    const {  addDesk, parentId } = this.props;
    let selectedList = [];
    applications.forEach((da, index) => {
      if (da.selected == "3") {
        selectedList.push(da);
      }
      if (da.service.length == 0) return;
      da.service.forEach((_da, j) => {
        if (_da.selected == "3") {
          selectedList.push(_da);
        }
      });
    })
    addDesk({ dataList: selectedList, parentId });
    this.setState({
      edit: false
    });
    this.props.close();
  }

  btnClose = () => {
    this.props.close();
  }


  btnTypeClick = (da) => {
    const { data: { labelGroups } } = this.state;
    labelGroups.forEach((_da, i) => {
      _da.labelGroupName == da.labelGroupName ? _da.active = true : _da.active = false;
    })
    this.setState({
      ...this.state
    })
  }

  onBtnOnclick = (_data) => {
    const { applicationsMap } = this.props;
    const { data, data: { labelGroups } } = this.state;
    let _applications = [];
    let activeLabelGroups = labelGroups.find((da) => da.active);
    activeLabelGroups.labels.forEach((da) => {
      da.active = false
    });
    if (_data.labelId == "all") {
      let allLabel = activeLabelGroups.labels.find((da) => da.labelId == "all");
      allLabel.active = true;
      _applications = data.applications;
    } else {
      let labels = activeLabelGroups.labels.find((da) => da.labelId == _data.labelId);
      labels.active = true;
      labels.appIds.forEach((appId) => {
        _applications.push(applicationsMap[appId]);
      })
    }
    this.setState({
      ...this.state,
      applications: _applications
    })
  }

  btnUp = (data) => {
    this.state.applications.forEach((da, i) => {
      if (da.applicationId == data.applicationId) {
        da.extend = data.extend ? false : true;
      }
    });
    this.setState({
      ...this.state.applications
    });
  }

  onKeyup = (e) => {
    if (e.keyCode === 13) {
      this.btnSearch(e);
    }
  }

  render() {
    const { data: { labelGroups = [] }, applications } = this.state;
    const { languagesJSON } = this.props;
    let btns = [];
    labelGroups.forEach(({ active, labels }, i) => {
      if (active) {
        labels.forEach((da, j) => {
          btns.push(<Button key={`button_li_${da.labelId}-${i}-${j}`} shape='border'
            className={da.active ? 'active' : ''} onClick={() => {
              this.onBtnOnclick(da)
            }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{da.labelName}</Button>);
        })
      }
    })
    let list = [];
    applications.forEach((item, i) => {
      const { service, service: { serviceId: id, serviceName: name }, widgetTemplate: { serviceType } } = item;
      let _b = item.extend;
      if (serviceType == "2") {
        item.serviceId = item.applicationId;
        item.serviceName = item.applicationName;
        item.serviceType = "2";//2应用
        item.serviceIcon = item.applicationIcon;
        item.serviceCode = item.applicationCode;
        item.widgettemplateId = item.widgetTemplate.widgettemplateId;
        // item.extend = false;
        list.push(<ServiceItem key={`widget-title-${i}-${item.serviceId}`} onChange={this.onChange} data={item}
          packUp={this.btnUp} arrow={service && service.length > 0 ? true : false}
          languagesJSON={languagesJSON} />);
      }
      item.service.forEach((da, i) => {
        da.extend = _b;
        list.push(<ServiceItem key={`widget-${guid()}`} onChange={this.onChange} data={da}
          languagesJSON={languagesJSON} />);
      });
    })
    return (<div className={select_widget_list}>
      {/* <div className={widget_left}>
          <div className={title}>添加服务</div>
       </div> */}
      <div className={widget_right}>
        <SearchInput
          onKeyDown={this.onKeyup}
          onChange={this.inputOnChange}
          keywords={this.state.value}
          onClick={this.btnSearch}
          placeholder={languagesJSON.searchContent}
          btnText={languagesJSON.search}
        />
        <div className={panel}>
          <div className={panel_left}>
            <div className={btn_type}>
              <ButtonGroup>
                {
                  labelGroups.map((da, i) => <Button key={`type-${i}`} className={da.active ? btn_active : null}
                    shape='border' onClick={() => {
                      this.btnTypeClick(da)
                    }}>{da.labelGroupName}</Button>)
                }
              </ButtonGroup>
            </div>
            <div className={server_type}>
              <ButtonGroup vertical>
                {btns}
              </ButtonGroup>
            </div>
          </div>
          <div className={panel_right}>
            <div>{list}</div>
          </div>
        </div>
        <div className={footer_btn}>
          {this.state.edit ? <ButtonBrand onClick={this.btnSave}>{languagesJSON.add}</ButtonBrand> :
            <ButtonBrand disabled={true}>{languagesJSON.add}</ButtonBrand>}
          <ButtonDefaultAlpha onClick={this.btnClose}>{languagesJSON.cancel}</ButtonDefaultAlpha>
        </div>
      </div>
    </div>);
  }
}

export default SelectWidgetList;
