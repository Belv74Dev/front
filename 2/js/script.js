import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
// ? add "addDoc" for create data and import code from file "addStudents"
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
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
const data = await getStudents(db);

// *** Render table
const table = document.querySelector('.student-table');
const trs = document.querySelectorAll('.tr-data');

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

const createCailBtn = () => {
  const td = document.createElement('td');
  td.className = 'student-table__cail student-table__action';
  td.innerHTML = `
    <div class="student-table__action-img ok">
      <img src="./img/ok.svg" alt="Сохранить" class="student-table__action-edit">
    </div>
    <div class="student-table__action-img del">
      <img src="./img/del.svg" alt="Удалить" class="student-table__action-edit">
    </div>
  `;
  return td;
};

const uniqueGroups = [...new Set(data.map((item) => item.group))]

const renderTable = (data) => {
	table.innerHTML = '';
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

trs.forEach((tr) => {
  const id = tr.getAttribute('data-id');
  const docRef = doc(db, '/students', id);

  tr.querySelector('.ok').addEventListener('click', (e) => {
    tr.classList.add('update-this-item-start');
    const inputs = tr.querySelectorAll('input');
    const select = tr.querySelector('select');
    console.log(inputs, inputs[0])
    const data = {
      lastname : inputs[0].value,
      firstname: inputs[1].value,
      patronymic: inputs[2].value,
      birthd: new Date(inputs[3].value),
      score: inputs[4].value,
      group: select.value,
    }
    updateDoc(docRef, data)
    .then(() => {
      tr.classList.add('update-this-item-end');
      console.log("Entire Document has been deleted successfully.")
    })
    .catch(error => {
      console.log(error);
    })
  })
  tr.querySelector('.del').addEventListener('click', (e) => {
    tr.classList.add('del-this-item');
    deleteDoc(docRef)
    .then(() => {
      tr.parentNode.removeChild(tr);
      console.log("Entire Document has been deleted successfully.")
    })
    .catch(error => {
      console.log(error);
    })
  })
});

// *** Filtering
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
	if (birthd.value) getfilterItems('str-full', 'patronymic', patronymic.value);
	if (minScore.value) getfilterItems('num-min', 'score', minScore.value);
	if (maxScore.value) getfilterItems('num-max', 'score', maxScore.value);
	if (selectGroup.value !== 'null') getfilterItems('str-full', 'group', selectGroup.value);

	renderTable(getfilterItems());
});