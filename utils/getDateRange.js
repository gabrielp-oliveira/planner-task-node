function DateRange(beg, end){
    let today = end;
    let beguin = new Date(beg);
    let diffMs = (beguin - today);
    let minutes = Math.floor(diffMs / 60000);
    return Math.abs(minutes)
}

module.exports = DateRange
