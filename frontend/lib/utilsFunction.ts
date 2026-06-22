import moment from "moment";

export const readableDate =(date: string)=>{
    return moment(date).format("DD MMM YYYY, hh:mm A");
}