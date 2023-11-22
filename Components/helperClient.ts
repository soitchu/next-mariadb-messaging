export function dateToHuman(dateString: string) {
  const date = new Date(dateString);
  return (
    date.getHours().toString().padStart(2, "0") +
    " : " +
    date.getMinutes().toString().padStart(2, "0")
  );
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
