document.addEventListener('DOMContentLoaded', loadDB(function(obj) {
	if (obj != 0) {
		document.getElementsByClassName('placeholder')[0].classList.add('hiden');
		buildPage(obj, 0);
	}
}));

var addUser = document.getElementById('addUser');
addUser.addEventListener('click', function() {
	popupOpen();
	clickClose();
});

var submit = document.getElementById('submit');
submit.addEventListener('click', function() {
	validate('initialInput', function() {
		loadDB(function(obj) {
			obj.push( formToObj('full-name', 'email', 'comment') );
			saveDB(obj, function() {
				console.log('saved');
				purge();
				clearForm('initialInput');

				loadDB(function(obj) {
					console.log(obj)
					var lastIndex = obj.length-1;
					buildPage(obj, lastIndex);
					document.getElementsByClassName('placeholder')[0].classList.add('hiden');
					popupClose();
				});
			});
		});
	});
});


// ----- functions -----

// ajax calls
function loadDB(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'db/db.json', true);
	xhr.send();
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log(xhr.status);
		} else {
			var obj = JSON.parse(xhr.responseText);
			callback(obj);
		}
	};
}

function saveDB(data, callback) {
	json = JSON.stringify(data);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'db/handler.php', true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	xhr.send(json);
	xhr.onreadystatechange = function(){
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log(xhr.status + ': ' + xhr.statusText)
		} else {
			callback();
			console.log(xhr.status)
		}
	};
}

/* 
obj - main object with a server response data. 
Index is to pass it to the list building function and assign appropriate 'focus' css class.
*/
function buildPage (obj, index) {
	buildLinks(obj);
	buildList(obj, index);	
	linksConfigure();
}

function buildLinks (obj) {
	obj.forEach(function(obj) {
		addLink(obj);
	});
}

function addLink(obj) {
	var links = document.getElementById('links'),
		newLink = document.createElement('a'),
		delBtn = document.createElement('span');

	var surname = obj.fullname.split(' ');

	newLink.setAttribute('href', '#');
	newLink.className = 'select';
	newLink.innerHTML = surname[0];

	delBtn.className = 'deletePerson';
	delBtn.innerHTML = '<i class="fa fa-times-circle fa-lg"></i>';
	newLink.appendChild(delBtn);

	links.insertBefore(newLink, addUser);
}

function buildList (obj, index) {
	obj.forEach(function(obj) {
		addBlock(obj);
	});
	var focusedCard = document.getElementsByClassName('card')[index];
	focusedCard.classList.add('focus');
}

function addBlock(obj) {
	var cardList = document.getElementById('cardlist');

	var fullName = addLi('ФИО', obj.fullname),
		email = addMail('Эл. почта', obj.email),
		comment = addLi('Комментарий', obj.comment),
		editBtn = addEditBtns(),
		ulItems = fullName + email + comment + editBtn;

	var newUl = document.createElement('ul');
	newUl.className = 'card';
	newUl.innerHTML = ulItems;

	cardList.appendChild(newUl);

	function addLi(header, value) {
		var liContainer = document.createElement('div'),
			newLi = document.createElement('li');

		newLi.innerHTML = '<h1>' + header + '</h1>' + '<p>' + value + '</p>';

		if (value == 0) {
			newLi.className = 'invis';
		}

		liContainer.appendChild(newLi);
		return liContainer.innerHTML;
	}

	function addMail(header, value) {
		var liContainer = document.createElement('div'),
			newLi = document.createElement('li');

		newLi.innerHTML = '<h1>' + header + '</h1>' + '<a>' + value + '</a>';
		var mailLink = 'mailto:' + obj.email;
		newLi.children[1].setAttribute('href', mailLink);

		liContainer.appendChild(newLi);
		return liContainer.innerHTML;
	}

	function addEditBtns() {
		var liContainer = document.createElement('div'),
			newLi = document.createElement('li'),
			editBtn = document.createElement('a'),
			saveBtn = document.createElement('a'),
			cancelBtn = document.createElement('a');

		editBtn.setAttribute('href', '#');
		editBtn.classList.add('editBtn', 'btnFocus');
		editBtn.innerHTML = 'Редактировать';

		saveBtn.setAttribute('href', '#');
		saveBtn.className = 'saveEdit';
		saveBtn.innerHTML = 'Сохранить';

		cancelBtn.setAttribute('href', '#');
		cancelBtn.className = 'cancelEdit';
		cancelBtn.innerHTML = 'Отмена';

		newLi.className = 'edit'
		newLi.appendChild(editBtn);
		newLi.appendChild(saveBtn);
		newLi.appendChild(cancelBtn);
		liContainer.appendChild(newLi);
		return liContainer.innerHTML;
	}
}

function linksConfigure() {
	var links = document.getElementsByClassName('select'),
		cards = document.getElementsByClassName('card'),
		delButtons = document.getElementsByClassName('deletePerson'),
		editButtons = document.getElementsByClassName('editBtn'),
		editInputs = document.getElementsByClassName('editInput'),
		saveButtons = document.getElementsByClassName('saveEdit'),
		cancelButtons = document.getElementsByClassName('cancelEdit');

	var linksArr = Array.prototype.slice.call(links),
		cardsArr = Array.prototype.slice.call(cards),
		delButtonsArr = Array.prototype.slice.call(delButtons),
		editButtonsArr = Array.prototype.slice.call(editButtons),
		saveButtonsArr = Array.prototype.slice.call(saveButtons),
		cancelButtonsArr = Array.prototype.slice.call(cancelButtons);

	linksArr.forEach(function(item, index) {
		item.addEventListener('click', function() {
			var linkIndex = index;
			clickedCard = getClikedCard(linkIndex);
		
			var currentCard = document.getElementsByClassName('focus')[0];
			currentCard.classList.remove('focus');
			clickedCard.classList.add('focus');
		});
	});

	delButtonsArr.forEach(function(item, index) {
		item.addEventListener('click', function() {
			var delBtnIndex = index;
			deletePerson(index)
		});
	});

	editButtonsArr.forEach(function(item, index) {
		item.addEventListener('click', function() {
			var linkIndex = index;
			clickedCard = getClikedCard(linkIndex);

			edit(clickedCard);
			document.getElementById('editedName').focus();
			editButtonsArr[linkIndex].classList.remove('btnFocus');
			saveButtonsArr[linkIndex].classList.add('btnFocus');
			cancelButtonsArr[linkIndex].classList.add('btnFocus');

			if (editInputs.length > 0) {
				linksArr.forEach(function(item) {
					item.classList.add('invis');
				});
				document.getElementById('addUser').classList.add('invis');
			}
		});
	});

	saveButtonsArr.forEach(function(item, index) {
		item.addEventListener('click', function() {
			var linkIndex = index;

			validate('editInput', function() {
				loadDB(function(obj) {
					editedObj = formToObj('editedName', 'editedMail', 'editedComment');
					obj.splice(linkIndex, 1, editedObj);
					saveDB(obj, function() {
						console.log('edited');
						purge();
						loadDB(function(obj) {
							buildPage(obj, linkIndex);
							document.getElementById('addUser').classList.remove('invis');
						});
					});
				});
			});
		});
	});

	cancelButtonsArr.forEach(function(item, index) {
		item.addEventListener('click', function() {
			var linkIndex = index,
				inputs = document.getElementsByClassName('editInput'),
				errors = document.getElementsByClassName('error');

			while (inputs.length > 0) {
				inputs.item(0).remove();
				
				if (errors.length > 0) {
					errors.item(0).remove();
				}
			}

			saveButtonsArr[linkIndex].classList.remove('btnFocus');
			cancelButtonsArr[linkIndex].classList.remove('btnFocus');
			editButtonsArr[linkIndex].classList.add('btnFocus');

			linksArr.forEach(function(item) {
				item.classList.remove('invis');
			});
			document.getElementById('addUser').classList.remove('invis');
		});
	});

	function getClikedCard(index) {
		var clickedCard = cardsArr.filter(function(value, i) {
			return i == index;
		})[0];
		return clickedCard;
	}
}

// edit
function edit(data) {
	var nameInput = document.createElement('input'),
		mailInput = document.createElement('input'),
		commentInput = document.createElement('textarea');

	var name = data.children[0].lastChild.innerHTML,
		mail = data.children[1].lastChild.innerHTML,
		comment = data.children[2].lastChild.innerHTML;

	nameInput.value = name;
	mailInput.value = mail;
	commentInput.value = comment;

	nameInput.setAttribute('type', 'text');
	nameInput.id = 'editedName';
	nameInput.className = 'editInput';

	mailInput.setAttribute('type', 'email');
	mailInput.id = 'editedMail';
	mailInput.className = 'editInput';

	commentInput.setAttribute('type', 'text');
	commentInput.id = 'editedComment';
	commentInput.className = 'editInput';

	data.children[0].appendChild(nameInput);
	data.children[1].appendChild(mailInput);
	data.children[2].appendChild(commentInput);
}

// deletion
function deletePerson(index) {
	loadDB(function(obj) {
		obj.splice(index, 1);
		saveDB(obj, function() {
			console.log('deleted');
			purge();

			loadDB(function(obj) {
				if (obj == 0) {
					var placeHolder = document.createElement('p');
					placeHolder.className = 'placeholder';
					placeHolder.innerHTML = 'Теперь здесь никого нет :('
					document.getElementById('cardlist').appendChild(placeHolder);
				}

				buildPage(obj, 0);
			});
		});
	});
}

function purge() {
	var links = document.getElementById('links'),
		cards = document.getElementById('cardlist');

	while (links.childElementCount > 1) {
		links.removeChild(links.firstChild);
	}	

	while (cards.childElementCount > 0) {
		cards.removeChild(cards.firstChild);
	}
}

// forms
function formToObj(name, email, comment) {
	var inputName = document.getElementById(name).value,
		inputEmail = document.getElementById(email).value,
		inputComment = document.getElementById(comment).value;

	var obj = {
		fullname: inputName,
		email: inputEmail,
		comment: inputComment
	};
	return obj;
}

function clearForm(className) {
	var node = document.getElementsByClassName(className),
		arr = Array.prototype.slice.call(node);
	arr.forEach(function(item) {
		item.value = '';
	});
}

function validate(className, callback) {
	var node = document.getElementsByClassName(className),
		arr = Array.prototype.slice.call(node);
	var name = arr[0],
		email = arr[1];

	if (!name.value) {
			resetError(name.parentElement);
			showError(name.parentElement, 'Это поле обязательно для заполнения!');
			name.classList.add('input-error');

		} else if (name.value.length < 2 || name.value.match(/[\s]/g) < 2) {
			resetError(name.parentElement);
			showError(name.parentElement, 'Введите, пожалуйста, полные ФИО');
			name.classList.add('input-error');
		} else {
			resetError(name.parentElement);
			name.classList.remove('input-error');
			var nameApproved = 1;
		}

	if (!email.value) {
		resetError(email.parentElement);
		showError(email.parentElement, 'Вы забыли указать email!');
		email.classList.add('input-error');
	} else if (email.value.includes('@') === false) {
		resetError(email.parentElement);
		showError(email.parentElement, 'Email должен содержать @!');
		email.classList.add('input-error');
	} else {
		resetError(email.parentElement);
		email.classList.remove('input-error');
		var emailApproved = 1;
	}

	if (nameApproved === 1 & emailApproved === 1) {
		callback();
	}

	function showError(element, errMessage) {
		var span = document.createElement('span');
		span.className = 'error';
		span.innerHTML = errMessage;
		element.appendChild(span);
	}

	function resetError(element) {
		if (element.lastChild.className == 'error') {
			element.removeChild(element.lastChild);
		}
	}
}

// popup 
var popupBack = document.getElementById('popup-back'),
	popupWrap = document.getElementById('popup-wrap'),
	popupContainer = document.getElementById('popup-container'),
	closeBtn = document.getElementById('closePopup');

function popupOpen() {
	popupBack.classList.add('visible');
	popupWrap.classList.add('visible');
}

function popupClose() {
	popupBack.classList.remove('visible');
	popupWrap.classList.remove('visible');
}

function clickClose() {

	popupContainer.addEventListener('click', function(event) {
		console.log(event.target)
		if (event.target == popupContainer || event.target == closeBtn) {
			popupClose();
		}
	});
}









