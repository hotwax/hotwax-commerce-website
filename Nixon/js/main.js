// let fixedHeader = document.querySelector('.fixed-header');
// if (fixedHeader !== null) {
// 	let headerHeight = ()=> {
// 		let getHeight = document.querySelector('.header-container-wrap .header').offsetHeight;
// 		let headerWrap = document.querySelector('.header-container-wrap');
// 		headerWrap.style.minHeight  = getHeight + 'px';	
// 	}
// 	setInterval(function () {
// 		headerHeight();
// 	}, 500);
// }


let img2 = document.querySelectorAll('.background_settings .img2');
new simpleParallax(img2, {
	scale: 1.5,
	delay: .6,
	transition: 'cubic-bezier(0,0,0,1)' 
});


let fixedHeader12 = document.querySelector('.fixed-header');
window.addEventListener('load',()=>{
	let hasVal = window.location.hash;
	if(hasVal) {
		if (fixedHeader12 !== null) {
			let getHeight12 = document.querySelector('.header-container-wrap .header').offsetHeight;	
			let haswU = document.querySelector(hasVal);
			window.scroll({
				behavior: 'smooth',
				left: 0,
				top: haswU.offsetTop-getHeight12
			});
		} else {
			window.scroll({
				behavior: 'smooth',
				left: 0,
				top: haswU.offsetTop
			});
		}
	}
});

let smoothScroll = document.querySelectorAll('a');
for(var i = 0; i<smoothScroll.length; i++){
	let hashl = smoothScroll[i].hash;
	if(hashl !=''){
		smoothScroll[i].addEventListener('click', function(e){
			let hashId = document.querySelector(hashl);
			if(hashId !=null){
				e.preventDefault();
				if (fixedHeader12 !== null) {
					let getHeight12 = document.querySelector('.header-container-wrap .header').offsetHeight;	
					window.scroll({
						behavior: 'smooth',
						left: 0,
						top: hashId.offsetTop-getHeight12
					});
				} else {
					window.scroll({
						behavior: 'smooth',
						left: 0,
						top: hashId.offsetTop
					});
				}
			}
		})
	}
}



(function (){
	let y = document.querySelector('.fixed-header .header')
	if (y !== null) {
		window.addEventListener('load',()=>{
			document.querySelector('.header-container-wrap').style.minHeight  = `${y.offsetHeight}px`;
			y.style.position = "fixed";
		})
		window.addEventListener('resize',()=>{
			document.querySelector('.header-container-wrap').style.minHeight  = `${y.offsetHeight}px`;
		});
	}
})();
