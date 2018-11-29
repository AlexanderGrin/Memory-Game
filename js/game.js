// Игровой процесс
var relation=2.17;
var widthOffset=Math.trunc(226/relation); //104
var heightOffset=Math.trunc(314/relation);   //144

var Suit=['C','D','H','S'];
var Par=['0','2','3','4','5','6','7','8','9','A','J','K','Q'];
var cards=[];
var firstopen=false;
var cardopen=true;
var first_card_index=-1;
var Points=0;

var Card=function(index,left,value){
	this.index=index;
	this.left=left;
	this.value=value;
	this.img=new Image();
	this.img.src='Cards/'+value+'.png';
}

function LoadImage(img,index){
	img.onload=function(){
		document.getElementById(index).src=img.src;
		document.getElementById(index).style.width=Math.trunc(img.width/relation)+'px';
		document.getElementById(index).style.height=Math.trunc(img.height/relation)+'px';
	}
}

function LoadFront(value,left,index){
	document.getElementById(index).dataset.tid="Card";
	curWidth=widthOffset;
	curLeft=left;
	var state=true;
	if (firstopen) cardopen=true;
	var timer=setInterval(function(){
		if (state)
		{
			curWidth-=2;
			document.getElementById(index).style.width=curWidth+'px';
			curLeft+=1;
			document.getElementById(index).style.left=curLeft+"px";
		}
		else
		{
			curWidth+=2;
			document.getElementById(index).style.width=curWidth+'px';
			curLeft-=1;
			document.getElementById(index).style.left=curLeft+"px";
		}
		if (curWidth>=widthOffset){
			if (firstopen) cardopen=false;
			clearInterval(timer);
		}
		else if (curWidth<4)
		{ 	
			state=false; 
			document.getElementById(index).src='Cards/'+value+'.png';
		}
	},5);
}

function Clear(index){
	document.getElementById(index).style.opacity="0";
	document.getElementById(index).dataset.tid=" ";
	document.getElementById(index).id+="_NONE";
	
}

Card.prototype={
 load: function(){
	LoadImage(this.img,this.index);
 },
 loadfront: function(){
	LoadFront(this.value,this.left,this.index);
 },
 clear: function(){
	Clear(this.index);
 },
 get_index: function(){
	return this.index;
 },
 get_left: function(){
	return this.left;
 }
};

// Проверка карт событие onclick 
function CardClick(event){
	var id=event.target.id;
	if(!cardopen){
		for (index=0;index<cards.length;index++){
			if (cards[index].get_index()==id){
				//console.log("index="+index);
				if (first_card_index==-1){
					first_card_index=index;
					firstopen=true;
					cards[index].loadfront();
				}
				else if (cards[index].value==cards[first_card_index].value && index!=first_card_index){
					cards[index].loadfront();
					Points+=((cards.length-2)/2)*42;
					document.getElementById("points").innerHTML=Points;
					cardopen=true;
					firstopen=false;
					setTimeout(clearTwoCard,1000,first_card_index,index);
					first_card_index=-1;
				}
				else if (cards[index].value!=cards[first_card_index].value && index!=first_card_index){
					cards[index].loadfront();
					if (cards.length!=18) Points-=((18-cards.length)/2)*42;
					document.getElementById("points").innerHTML=Points;
					cardopen=true;
					firstopen=false
					setTimeout(returnTwoCard,1000,first_card_index,index);
					first_card_index=-1;
				}
				index=cards.length;
			}
		}
	}
}

// Очистка двух карт со стола если они равны 
function clearTwoCard(first_index,second_index){
	cardopen=false;
	cards[first_index].clear();
	cards[second_index].clear();
	if (second_index<first_index){
		cards.splice(second_index,1);
		cards.splice(first_index-1,1);
	}
	else {
		cards.splice(first_index,1);
		cards.splice(second_index-1,1);
	}
	if (cards.length==0) {
		var win=window.open("EndPage.html?score="+Points,"_self");
		window.onload=function(){
			alert("hello");
			var label=win.document.getElementById("rez");
			label.innerHTML=Points;
			document.getElementById("rez").innerHTML="Поздравляем! Ваш итоговый счет: "+ Points;
		}
	}
}

function returnTwoCard(first_index,second_index){
	var firstCard=document.getElementById(cards[first_index].get_index());
	var secondCard=document.getElementById(cards[second_index].get_index());
	firstCard.dataset.tid="Card-flipped";
	secondCard.dataset.tid="Card-flipped";
	curWidth=widthOffset;
	firstLeft=cards[first_index].get_left();
	secondLeft=cards[second_index].get_left();
	var state=true;
	var timer=setInterval(function(){
		console.log("width="+curWidth);
		if (state)
		{
			curWidth-=2;
			firstCard.style.width=curWidth+'px';
			secondCard.style.width=curWidth+'px';
			firstLeft+=1;
			secondLeft+=1;
			firstCard.style.left=firstLeft+"px";
			secondCard.style.left=secondLeft+"px";
		}
		else
		{
			curWidth+=2;
			firstCard.style.width=curWidth+'px';
			secondCard.style.width=curWidth+'px';
			firstLeft-=1;
			secondLeft-=1;
			firstCard.style.left=firstLeft+"px";
			secondCard.style.left=secondLeft+"px";
		}
		if (curWidth>=widthOffset){
				cardopen=false;
				clearInterval(timer);
		}
		else if (curWidth<=4)
		{ 	
			state=false; 
			firstCard.src="Cards/back.png";
			firstCard.onload=function(){}
			secondCard.src="Cards/back.png";
			secondCard.onload=function(){}
		}
	},3);
}

// Инициализация всех карт на canvas
function generateBoard(){
	var pair_cards=[],count_pair=0;
	// Генерация 9 карт из колоды
	while(count_pair<9){
		var value=Par[Math.floor(Math.random()*13)]+Suit[Math.floor(Math.random()*4)];
		if (pair_cards.indexOf(value)==-1) {
			pair_cards.push(value);
			++count_pair;
		}
	}
	var count=0;
	var sequence_cards=[];
	//Генерация последовательности 18 карт на столе
	while(count!=18)
	{
		value=pair_cards[Math.floor(Math.random()*9)];
	 	if (sequence_cards.indexOf(value)==-1 || sequence_cards.lastIndexOf(value)==sequence_cards.indexOf(value)){
				sequence_cards.push(value);
				++count;
		}
	}	
	initCards(sequence_cards);
	LoadCards();
	setTimeout(AllToBack,5000);
};

// Инициализация всех карт
function initCards(sequence_cards){
	var index=0;
	var x=0,y=0;
	for(i=0;i<3;i++,y+=(heightOffset+15) /*heightOffset*/){
		x=0;
		for(j=0;j<6;j++,index++,x+=(widthOffset+15)	 /*widthOffset*/){
			// x,y
			cards.push(new Card(index,x,sequence_cards[index]));
			document.getElementById(index).style.position='absolute';
			document.getElementById(index).style.left=Math.trunc(x)+'px';
			document.getElementById(index).style.top=Math.trunc(y)+'px';
		}
	}
};

// Загрузка всех карт
function LoadCards(){
	for(index=0;index<cards.length;index++)
		cards[index].load();
};

// Переворот всех карт рубашкой вверх
function AllToBack(){
	curWidth=widthOffset;
	var lefts=[];
	for(index=0;index<cards.length;index++)
		lefts.push(cards[index].get_left());
	var state=true;
	var timer=setInterval(function(){
		if (state)
		{
			curWidth-=2;
			for(index=0;index<cards.length;index++){
				document.getElementById(index).style.width=curWidth+'px';
				lefts[index]+=1;
				document.getElementById(index).style.left=lefts[index]+"px";
			}
		}
		else{
			curWidth+=2;
			for(index=0;index<cards.length;index++){
				document.getElementById(index).style.width=curWidth+'px';
				lefts[index]-=1;
				document.getElementById(index).style.left=lefts[index]+"px";
			}
		}	
		if (curWidth>=widthOffset){
			cardopen=false;
			clearInterval(timer);
		}
		else if (curWidth<=4){ 	
			state=false; 
			for(index=0;index<cards.length;index++){
				document.getElementById(index).src="Cards/back.png";
				document.getElementById(index).dataset.tid="Card-flipped";
			}
		}
	},3);
	return;
};

// Запуск всего игрового процесса, генерация стола
generateBoard();