import logo from './logo.svg';
import DragDrop from './manageWidgetForHomepage'
import './App.css';

function App() {
  return (
    <div className="App">
      <DragDrop 
        menuList={menuList}
        groupList={manageList}
        languagesJSON={LanguagesJSON}
        // history={this.props.history}
        // match={this.props.match}
        save={()=>{}}
        goBack={()=>{}}
        locale={{}}
      />
      {/* <CreateManageModule
          menuList={menuList}
          groupList={manageList}
          languagesJSON={LanguagesJSON}
          history={this.props.history}
          match={this.props.match}
          save={this.setManageListSave}
          goBack={this.goBack}
          locale={locale}
        /> */}
    </div>
  );
}
const manageWidget = {
	addGroup: '添加分组',
	groupName_max_words_four: '分组名称,最多4个字符',
	rename_group: '重命名分组',
	add_folder: '添加文件夹',
	confirm: '确认',
	cancel: '取消',
	confirm_del_this_item: '您确认要删除此项？',
	'delete': '删除',
	moveTo: '移动到',
	save: '保存',
	deleteService: '删除服务',
	confirm_delete_this_service: '您确认要删除此项服务？',
	move: '移动',
	group: '分组',
	to: '到',
	notSave: '不保存',
	confirm_to_delete_batch: '您确认要批量删除吗？',
	notSave_to_lose_new_modify: '点击不保存，则最新修改将丢失',
	addQuick_to_home: '添加快捷方式至首页',
	all: '全部',
	search: '搜索',
	add: '添加',
	searchContent: '搜索内容...',
	added: '已添加',
	notAdd: '未添加',
	extend: '展开',
	unfold: '收起',
	rename_folder: '重命名文件夹',
	delete_folder: '删除文件夹',
	confirm_delete_service: '您确认要删除服务',
	group_name_exists: '分组名称已存在！',
	move_down: '下移',
	move_up: '上移',
	more: '更多',
	save_latest_or_not: '是否保存最新修改？',
	noDataGroup: '无内容的分组在首页不可见',
	notice: '拖动下方磁贴至右侧所需位置',
	inputServiceName:'输入服务名称',
    noData:'暂无结果',	
};
export default App;
