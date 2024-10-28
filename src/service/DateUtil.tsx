export class DateUtil {
  private date: Date;
  private now: Date;

  constructor(time: string) {
    if (time === null) {
      throw new Error("Invalid time");
    }
    this.date = new Date(time);
    this.now = new Date();
  }

  private getMinutesDifference(): number {
    const timeDifference = this.now.getTime() - this.date.getTime();
    return Math.floor(timeDifference / (1000 * 60));
  }

  private getHoursDifference(): number {
    const timeDifference = this.now.getTime() - this.date.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60));
  }

  private isSameDay(): boolean {
    return this.date.toDateString() === this.now.toDateString();
  }

  public formatPostTime(): string {
    const minutesDifference = this.getMinutesDifference();
    const hoursDifference = this.getHoursDifference();

    if (minutesDifference < 60) {
      if (minutesDifference < 1) {
        return "Just now";
      }
      return `${minutesDifference} minutes ago`;
    } else if (hoursDifference < 6) {
      return `${hoursDifference} hours ago`;
    } else if (this.isSameDay()) {
      const formattedTime = this.date.toTimeString().slice(0, 5); // hh:mm
      return formattedTime + " today";
    } else {
      const formattedDate = this.date
        .toLocaleDateString("en-GB")
        .replace(/\//g, "/"); // dd/mm/yyyy
      const formattedTime = this.date.toTimeString().slice(0, 5); // hh:mm
      return `${formattedDate} ${formattedTime}`;
    }
  }

  public formatMessageTime(): string {
    const minutesDifference = this.getMinutesDifference();

    if (minutesDifference < 60) {
      return `${minutesDifference < 0 ? 0 : minutesDifference} minutes ago`;
    } else if (this.isSameDay()) {
      const formattedTime = this.date.toTimeString().slice(0, 5); // hh:mm
      return formattedTime;
    } else {
      const formattedDate = this.date
        .toLocaleDateString("en-GB")
        .replace(/\//g, "/"); // dd/mm/yyyy
      const formattedTime = this.date.toTimeString().slice(0, 5); // hh:mm
      return `${formattedDate} ${formattedTime}`;
    }
  }
}
