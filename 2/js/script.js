import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
// ? add "addDoc" for create data and import code from file "addStudents"
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, addDoc} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// *** Init app
const firebaseConfig = {
  apiKey: "AIzaSyCmLU5rIGlLeGLj7A7jgLcuTUZNOMQtfh4",
  authDomain: "mgtu-frontend.firebaseapp.com",
  projectId: "mgtu-frontend",
  storageBucket: "mgtu-frontend.appspot.com",
  messagingSenderId: "673579989891",
  appId: "1:673579989891:web:7a14147b0a48cae02e54b6",
  measurementId: "G-Q6EDYKJY8P"
};

const app = initializeApp(firebaseConfig);

const auth = await getAuth();
signInAnonymously(auth)

const db = getFirestore(app);

// const genUID = () => `${parseInt(Date.now() + Math.random())}`;
// const studentsCol = collection(db, '/students');
// addDoc(studentsCol, {
//   birthd: new Date(),
//   id: genUID(),
//   firstname: 'Макар',
//   lastname : 'Беляев-1',
//   patronymic: 'Дмитриевич',
//   group: "АВб-20-1",
//   score: 3
// })
// addDoc(studentsCol, {
//   birthd: new Date(),
//   id: genUID(),
//   firstname: 'Макар',
//   lastname : 'Беляев-2',
//   patronymic: 'Дмитриевич',
//   group: "АВб-20-2",
//   score: 4
// })
// addDoc(studentsCol, {
//   birthd: new Date(),
//   id: genUID(),
//   firstname: 'Макар',
//   lastname : 'Беляев',
//   patronymic: 'Дмитриевич',
//   group: "АВб-20-3",
//   score: 5
// })
// .then(docRef => {
//     console.log("Document has been added successfully");
// })
// .catch(error => {
//     console.log(error);
// })

const _formatingSecondToDate = (seconds) => {
  const date = new Date(seconds * 1000);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

//  *** Get students
async function getStudents(db) {
  const studentsCol = collection(db, '/students');
  const studentsSnapshot = await getDocs(studentsCol);
  const studentsList = studentsSnapshot.docs.map(doc => {
		return {
			...doc.data(), 
			id: doc.id,
			birthd: _formatingSecondToDate(doc.data().birthd.seconds)
		}
	}
	);
  return studentsList;
}
let data = await getStudents(db);

// *** Render table
const table = document.querySelector('.student-table');

const createCailInput = (value, type='text') => {
  const td = document.createElement('td');
  td.className = 'student-table__cail';
  td.innerHTML = `<input class="student-table__input" type=${type} value=${value}>`;
  return td;
}

const createCailSelect = (options, value) => {
  const td = document.createElement('td');
  td.className = 'student-table__cail';

  const select = document.createElement('select');
  select.className = 'student-table__input';
  
  options.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;

    select.append(option);
  })
  select.value = value;

  td.append(select);
  return td;
}

const handlerOkItem = (e) => {
	const tr = e.target.parentElement.parentElement.parentElement;

	tr.classList.add('del-this-item');
	const id = tr.getAttribute('data-id');
	const docRef = doc(db, '/students', id);

	tr.classList.add('update-this-item-start');
	const inputs = tr.querySelectorAll('input');
	const select = tr.querySelector('select');
	const dataItem = {
		lastname : inputs[0].value,
		firstname: inputs[1].value,
		patronymic: inputs[2].value,
		birthd: new Date(inputs[3].value),
		score: inputs[4].value,
		group: select.value,
	}

	data = data.map(item => {
		if (item.id == id) return {id, ...dataItem}
		return item;
	});
	console.log(data);

	updateDoc(docRef, dataItem)
	.then(() => {
		tr.classList.add('update-this-item-end');
	})
	.catch(error => {
		console.log('Error update: ', error);
	})
}

const handlerDelItem = (e) => {
	const tr = e.target.parentElement.parentElement.parentElement;

	// del listener in ok
	const ok = tr.querySelector('.ok'); 
	ok.removeEventListener('click', handlerOkItem)

	tr.classList.add('del-this-item');
	const id = tr.getAttribute('data-id');

	// del of data
	console.log(1, data);
	data = data.filter(item => {
		console.log(item.id, id)
		return item.id === id;
	});
	console.log(2, data);

	// const docRef = doc(db, '/students', id);
	deleteDoc(docRef)
	.then(() => {
		tr.parentNode.removeChild(tr);
	})
	.catch(error => {
		console.log('Error del: ', error);
	});
}

const createCailBtn = () => {
  const td = document.createElement('td');
  td.className = 'student-table__cail student-table__action';

	const ok = document.createElement('div');
	ok.className = 'student-table__action-img ok';
	ok.innerHTML = '<img src="./img/ok.svg" alt="Сохранить" class="student-table__action-edit">'
	ok.addEventListener('click', handlerOkItem)
	td.append(ok);

	const del = document.createElement('div');
	del.className = 'student-table__action-img del';
	del.innerHTML = '<img src="./img/del.svg" alt="Удалить" class="student-table__action-edit">'
	del.addEventListener('click', handlerDelItem, {once: true});
	td.append(del);
  return td;
};

const uniqueGroups = [...new Set(data.map((item) => item.group))]

const renderTable = (data) => {
	data.forEach((item) => {
		const tr = document.createElement('tr');
		tr.className = 'student-table__row tr-data';
		tr.setAttribute('data-id', item.id)
	
		tr.append(createCailInput(item?.lastname || ''));
		tr.append(createCailInput(item?.firstname || ''));
		tr.append(createCailInput(item?.patronymic) || '');
		tr.append(createCailInput(item?.birthd || '', 'date'));
		tr.append(createCailInput(item?.score)) || '';
	
		tr.append(createCailSelect(uniqueGroups, item.group))
	
		tr.append(createCailBtn());

		table.append(tr);
	});
};
renderTable(data);

// *** Filtering
const hiddenElements = (data) => {
	let trs = [...document.querySelectorAll(`.tr-data`)];
	trs.forEach((tr) => {
		tr.classList.add('hidden')
	});
	trs = trs.filter(tr => {
		const id = tr.getAttribute('data-id');
		console.log(tr, id)
		let hasId = false;
		data.forEach((item) => {
			if (item.id === id) hasId = true;
		})
		return hasId; 
	})
	trs.forEach((tr) => {
		tr.classList.remove('hidden')
	});
}

const filterForm = document.querySelector('.filter-form'),
			lastname = document.querySelector('#lastname'),
			firstname = document.querySelector('#firstname'),
			patronymic = document.querySelector('#patronymic'),
			birthd = document.querySelector('#birthd'),
			minScore = document.querySelector('#min-score'),
			maxScore = document.querySelector('#max-score'),
			selectGroup = document.querySelector('#select-group');

const filterStringField = (data) => {
	let arr = data; 
	return (filter, field, target) => {
		switch (filter) {
			case 'str-part':
				arr = arr.filter(item => item[field].toLowerCase().indexOf(target.toLowerCase()) !== -1);
				break;
			case 'str-full':
				arr = arr.filter(item => item[field] === target);
				break;
			case 'num-min':
				arr = arr.filter(item => +item[field] >= +target);
				break;
			case 'num-max':
				arr = arr.filter(item => +item[field] <= +target);
				break;
		}
		return arr;
	}
};

filterForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const getfilterItems = filterStringField([...data]);

	if (lastname.value) getfilterItems('str-part', 'lastname', lastname.value);
	if (firstname.value) getfilterItems('str-part', 'firstname', firstname.value);
	if (patronymic.value) getfilterItems('str-part', 'patronymic', patronymic.value);
	if (birthd.value) getfilterItems('str-full', 'birthd', birthd.value);
	if (minScore.value) getfilterItems('num-min', 'score', minScore.value);
	if (maxScore.value) getfilterItems('num-max', 'score', maxScore.value);
	if (selectGroup.value !== 'null') getfilterItems('str-full', 'group', selectGroup.value);

	hiddenElements(getfilterItems());
});