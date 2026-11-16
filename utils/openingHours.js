//Helpers for checking shop open-close time ("HH:mm") against a reservation date

//"09:30" -> 570
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

//Minutes since midnight of a date in the shop timezone
const getLocalMinutes = (date) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: process.env.SHOP_TIMEZONE || 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);

    const hour = Number(parts.find(p => p.type === 'hour').value);
    const minute = Number(parts.find(p => p.type === 'minute').value);
    return hour * 60 + minute;
};

//True if the whole massage (start -> start+duration) is inside opening hours
//Supports shops that close after midnight (e.g. 18:00 - 02:00)
exports.isWithinOpeningHours = (shop, date, duration) => {
    const open = toMinutes(shop.openTime);
    let close = toMinutes(shop.closeTime);
    let start = getLocalMinutes(date);

    if (close <= open) {
        close += 24 * 60;
        if (start < open) {
            start += 24 * 60;
        }
    }

    return start >= open && start + duration <= close;
};
