import moment from "moment";

function checkIfDayisToday(date: Date) {
  const today = new Date();
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
}

export function dateToHuman(dateString: string, includeDate = false) {
  const date = new Date(dateString);
  return !checkIfDayisToday(date)
    ? moment(date).format("HH:mm - Do MMM YYYY")
    : moment(date).format("HH:mm");
}

export function binarySearch(data, val) {
  let start = 0;
  let end = data.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (data[mid].id === val) {
      return mid;
    }

    if (val > data[mid].id) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return -1;
}
