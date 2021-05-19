// index.js
const app = getApp();
Page({
	data: {
		isLoading: true,					// 判断是否尚在加载中
		article: {}						// 内容数据
	},
	onLoad: function () {
		let result = app.towxml(`# Markdown`,'html',{
			base:'https://xxx.com',				// 相对资源的base路径
			//theme:'dark',					// 主题，默认`light`
			events:{					// 为元素绑定的事件方法
				tap:(e)=>{
					console.log('tap',e);
				}
			}
		});

		// 更新解析数据
		this.setData({
			article:result,
			isLoading: false
		});
		
	}
})