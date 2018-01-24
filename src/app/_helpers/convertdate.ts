export function convertDate(date) {

	if (!date) return '';

	var localDate = new Date(date);
  console.log(localDate, date);
  console.log(localDate.getDate());

	const returnDate = localDate.getDate() + '/' + localDate.getMonth()+1 + '/' + localDate.getFullYear();
	const returnTime = localDate.getHours() + ':' + localDate.getMinutes();
		
	return returnDate + ' - ' + returnTime; 

}