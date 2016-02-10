'use strict'

const btn = document.getElementById('btn')
const btn2 = document.getElementById('btn2')
const btn3 = document.getElementById('btn3')
const btn4 = document.getElementById('btn4')
const checkbox = document.getElementById('checkbox')
const target = document.getElementById('target')
const target2 = document.getElementById('target2')
const target3 = document.getElementById('target3')
const target4 = document.getElementById('target4')


function createRequest(load){
	return {
		method: 'GET',
		url: window.location.origin + '/file' + load + '.txt'
//		data: load
	}
}


function send(request){
	return Rx.Observable.create(observable => {
		const xhr = new XMLHttpRequest
		xhr.open(request.method, request.url, true)
		xhr.onload = function () {
			if(xhr.status == 200) {
				console.debug(xhr.response)
				observable.onNext(xhr.response)
				observable.onCompleted()
			} else if (xhr.status != 200) {
				console.error('err')
				observable.onError(Error(xhr.statusText))
				observable.onCompleted()
			}
		}
		xhr.onerror = function() {
			console.error('errr2')
			observable.onError(Error("connection error!"))
			observable.onCompleted()
		}
		xhr.send(/*request.data*/)
	})
}

function send2(request){
	return new Promise((su,fa) => {
		const xhr = new XMLHttpRequest
		xhr.open(request.method, request.url, true)
		xhr.onload = function () {
			if(xhr.status == 200) {
				console.debug(xhr.response)
				su(xhr.response)
			} else if (xhr.status != 200) {
				console.error('err')
				fa(Error(xhr.statusText))
			}
		}
		xhr.onerror = function() {
			console.error('errr2')
			fa(Error("connection error!"))
		}
		xhr.send(/*request.data*/)
	})
}

function addTextToTarget(targetElement,x){
	const p = document.createElement('p')
	const text = document.createTextNode(x)
	p.appendChild(text)
	targetElement.appendChild(p)
}


function uploadArray(array){
	return array.reduce((acc,x)=>(
		Rx.Observable.concat(acc, send(createRequest(x) )  ) 
	), Rx.Observable.empty())
}

/*
function uploadArray(array)(
	array.reduce((acc,x)=>(
		Rx.Observable.concat(acc, Rx.Observable.defer(()=>( send(createRequest(x)) )  ) )
	), Rx.Observable.empty())
)
*/

const okSource = uploadArray(createArray100())

const errorSource = uploadArray(createBrokenArray100()).singleInstance()

const errorWithRecover = errorSource.onErrorResumeNext(Rx.Observable.fromArray(['recovering!']))

const clickSource = Rx.Observable.fromEvent(btn,'click')
const clickErrorSource = Rx.Observable.fromEvent(btn2,'click')
const clickBothSource = Rx.Observable.fromEvent(btn3,'click')
const clickToggeableSource = Rx.Observable.fromEvent(btn4,'click')
const checkboxSource = Rx.Observable.fromEvent(checkbox, 'click').do(()=>console.info(checkbox.checked)).map(checkbox.checked)

function createArray100(){
	var array = []
	for(var i = 0; i<100; i++) array[i]=i
	return array
}

function createBrokenArray100(){
	var array = createArray100()
	array[15] = 765
	return array
}

clickSource.subscribe(()=>{
	okSource.subscribe(
		x=>addTextToTarget(target,'first button: ' + x)
		,err=>addTextToTarget(target,'first button error!: ' + err)
		,()=>addTextToTarget(target,'first button complete')
	)
})

clickErrorSource.subscribe(()=>{
	errorWithRecover.subscribe(
		x=>addTextToTarget(target2,'second button: ' + x)
		,err=>addTextToTarget(target2,'second button error!: ' + err)
		,()=>addTextToTarget(target2,'second button complete')
	)
})


const bothSource = Rx.Observable.combineLatest(okSource, errorSource,(fir,sec) => (
	'first: '+ fir + ' second: ' + sec
))

clickBothSource.subscribe(()=>{
	bothSource.subscribe(
		x=>addTextToTarget(target3,'both button: ' + x)
		,err=>addTextToTarget(target3,'both button error!: ' + err)
		,()=>addTextToTarget(target3,'both button complete')
	)
})

const range1 = Rx.Observable.interval(2000).map('first')
const range2 = Rx.Observable.range(1,10).map('second')

const toggeableSource = Rx.Observable.if(()=>(checkbox.checked),range1,range2)



clickToggeableSource.subscribe(()=>{
	toggeableSource.subscribe(
		x=>addTextToTarget(target4,'toggeable button: ' + x)
		,err=>addTextToTarget(target4,'toggeable button error!: ' + err)
		,()=>addTextToTarget(target4,'toggeable button complete')
	)
})
