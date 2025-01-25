# DatePicker
原生js实现的日期控件支持ie浏览器
调用方式
```
 // 安全的DOM加载检测（兼容IE）
function domReady(callback) {
	if (document.readyState === 'complete') {
		setTimeout(callback, 1);
	} else if (document.attachEvent) {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				callback();
			}
		});
	} else {
		document.addEventListener('DOMContentLoaded', callback, false);
	}
}
```
在需要的用的地方调用：
```
	var input = document.getElementById(ctrlName.id);
	domReady(function () {
		var picker = new DatePicker(input, { format: format });
		picker.show();
	});
```
