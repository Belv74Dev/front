const fullData = [1, 2, 3, 4, 5];
const emptyData = [4, 5];
let resData;

const diff = (data1, data2) => {
	return data1.filter(data1Item => {
		const isFind = data2.find(data2Item => data1Item === data2Item);
		return !isFind;
	})
}

resData = diff(fullData, emptyData) 

console.log('resData', resData);