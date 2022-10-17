// *** Добавить студента
const genUID = () => `${parseInt(Date.now() + Math.random())}`;

addDoc(studentsCol, {
  birthd: new Date(),
  id: genUID(),
  firstname: 'Макар',
  lastname : 'Беляев-1',
  patronymic: 'Дмитриевич',
  group: "АВб-20-1",
  score: 3
})
addDoc(studentsCol, {
  birthd: new Date(),
  id: genUID(),
  firstname: 'Макар',
  lastname : 'Беляев-2',
  patronymic: 'Дмитриевич',
  group: "АВб-20-2",
  score: 4
})
addDoc(studentsCol, {
  birthd: new Date(),
  id: genUID(),
  firstname: 'Макар',
  lastname : 'Беляев',
  patronymic: 'Дмитриевич',
  group: "АВб-20-3",
  score: 5
})
.then(docRef => {
    console.log("Document has been added successfully");
})
.catch(error => {
    console.log(error);
})