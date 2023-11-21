export function dateToHuman(dateString: string) {
    const date = new Date(dateString);
    return date.getHours().toString().padStart(2, "0") + " : " + date.getMinutes().toString().padStart(2, "0");
}