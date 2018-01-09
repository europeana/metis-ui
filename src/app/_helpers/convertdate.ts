export function convertDate(date) {
  
	console.log('convertDate', date);

	if (!date) return '';

	const splittedDate = date.split('T');
	const newDate = splittedDate[0].split('-');
	const newTime = splittedDate[1].split(':');
	
	const returnDate = newDate[2] + '/' + newDate[1] + '/' + newDate[0];
	const returnTime = newTime[0] + ':' + newTime[1];
	
	return returnDate + ' - ' + returnTime; 

}