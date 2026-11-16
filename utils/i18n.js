//Thai / English messages for every API response
//Language priority: ?lang=th|en  >  user's language in profile  >  Accept-Language header  >  en

const SUPPORTED_LANGUAGES = ['en', 'th'];

const messages = {
    en: {
        //Auth
        'auth.notAuthorized': 'Not authorized to access this route',
        'auth.roleNotAuthorized': 'User role {role} is not authorized to access this route',
        'auth.registerFailed': 'Cannot register user',
        'auth.provideEmailPassword': 'Please provide an email and password',
        'auth.invalidCredentials': 'Invalid credentials',
        'auth.loggedOut': 'Logged out successfully',
        'auth.profileUpdated': 'Profile updated successfully',
        'auth.updateProfileFailed': 'Cannot update profile',
        'auth.provideCurrentNewPassword': 'Please provide currentPassword and newPassword',
        'auth.currentPasswordIncorrect': 'Current password is incorrect',
        'auth.passwordUpdated': 'Password updated successfully',
        'auth.updatePasswordFailed': 'Cannot update password',

        //Massage shop
        'shop.notFound': 'No massage shop with the id of {id}',
        'shop.fetchFailed': 'Cannot find massage shop',
        'shop.createFailed': 'Cannot create massage shop',
        'shop.updateFailed': 'Cannot update massage shop',
        'shop.deleteFailed': 'Cannot delete massage shop',
        'shop.hasActiveReservations': 'Cannot delete this massage shop because it still has {count} active/upcoming reservation(s)',
        'shop.deleted': 'Massage shop deleted successfully',

        //Package / massage type
        'package.notFound': '{shop} does not offer {type} for {duration} minutes',
        'massageType.thai': 'Thai massage',
        'massageType.oil': 'Oil massage',
        'massageType.foot': 'Foot massage',
        'massageType.aroma': 'Aromatherapy massage',
        'massageType.herbal': 'Herbal compress massage',

        //Reservation
        'resv.notFound': 'No reservation with the id of {id}',
        'resv.fetchFailed': 'Cannot find reservation',
        'resv.createFailed': 'Cannot create reservation',
        'resv.updateFailed': 'Cannot update reservation',
        'resv.deleteFailed': 'Cannot delete reservation',
        'resv.missingFields': 'Please provide resvDate, massageType and duration',
        'resv.invalidDate': 'Invalid reservation date',
        'resv.dateInPast': 'Reservation date must be in the future',
        'resv.outsideHours': 'Reservation time (including massage duration) must be within the shop opening hours {open} - {close}',
        'resv.limitReached': 'The user with ID {id} has already made 3 active/upcoming reservations',
        'resv.userNotFound': 'No user with the id of {id}',
        'resv.notOwnerView': 'User {id} is not authorized to view this reservation',
        'resv.notOwnerUpdate': 'User {id} is not authorized to update this reservation',
        'resv.notOwnerDelete': 'User {id} is not authorized to delete this reservation',
        'resv.preview': 'Total price is {price} THB. Send the same body to POST /api/v1/massageshops/{shopId}/reservations to confirm',
        'resv.created': 'Reservation confirmed. Total price is {price} THB',
        'resv.updated': 'Reservation updated. Total price is {price} THB',
        'resv.deleted': 'Reservation deleted successfully',

        //Review
        'review.notFound': 'No review with the id of {id}',
        'review.fetchFailed': 'Cannot find review',
        'review.createFailed': 'Cannot create review',
        'review.updateFailed': 'Cannot update review',
        'review.deleteFailed': 'Cannot delete review',
        'review.notEligible': 'You can review a massage shop only after you have had a reservation there',
        'review.alreadyReviewed': 'You have already reviewed this massage shop',
        'review.notOwnerUpdate': 'User {id} is not authorized to update this review',
        'review.notOwnerDelete': 'User {id} is not authorized to delete this review',
        'review.deleted': 'Review deleted successfully',

        //Favorite
        'fav.fetchFailed': 'Cannot find favorite massage shops',
        'fav.updateFailed': 'Cannot update favorite massage shops',
        'fav.alreadyExists': 'This massage shop is already in your favorites',
        'fav.notInList': 'This massage shop is not in your favorites',
        'fav.added': 'Added to favorites',
        'fav.removed': 'Removed from favorites',

        //Notification
        'notif.reminder': 'Reminder: your {type} ({duration} min) at {shop} is on {date}',
        'notif.notFound': 'No notification with the id of {id}',
        'notif.notOwner': 'User {id} is not authorized to access this notification',
        'notif.fetchFailed': 'Cannot find notifications',
        'notif.updateFailed': 'Cannot update notification',
        'notif.deleteFailed': 'Cannot delete notification',
        'notif.markedRead': 'Notification marked as read',
        'notif.allMarkedRead': 'All notifications marked as read',
        'notif.deleted': 'Notification deleted successfully',

        //General errors
        'error.duplicate': 'Duplicate value for field: {field}',
        'error.invalidId': 'Invalid id: {value}',

        //Validation (used as messages in models)
        'validation.user.nameRequired': 'Please add a name',
        'validation.user.telRequired': 'Please add a telephone number',
        'validation.user.telInvalid': 'Please add a valid telephone number (e.g. 0812345678)',
        'validation.user.emailRequired': 'Please add an email',
        'validation.user.emailInvalid': 'Please add a valid email',
        'validation.user.passwordRequired': 'Please add a password',
        'validation.user.passwordMin': 'Password must be at least 6 characters',
        'validation.user.languageEnum': 'Language must be either th or en',
        'validation.shop.nameRequired': 'Please add a name',
        'validation.shop.nameMax': 'Name can not be more than 50 characters',
        'validation.shop.addressRequired': 'Please add an address',
        'validation.shop.telRequired': 'Please add a telephone number',
        'validation.shop.openTimeRequired': 'Please add an open time',
        'validation.shop.closeTimeRequired': 'Please add a close time',
        'validation.shop.timeInvalid': 'Time must be in HH:mm format (e.g. 09:00)',
        'validation.shop.packagesRequired': 'Please add at least one massage package',
        'validation.package.massageTypeRequired': 'Please add a massage type',
        'validation.package.massageTypeEnum': 'Massage type must be one of: thai, oil, foot, aroma, herbal',
        'validation.package.durationRequired': 'Please add a duration (minutes)',
        'validation.package.durationMin': 'Duration must be at least 15 minutes',
        'validation.package.priceRequired': 'Please add a price',
        'validation.package.priceMin': 'Price can not be negative',
        'validation.resv.dateRequired': 'Please add a reservation date',
        'validation.review.ratingRequired': 'Please add a rating between 1 and 5',
        'validation.review.ratingRange': 'Rating must be between 1 and 5',
        'validation.review.commentMax': 'Comment can not be more than 500 characters'
    },
    th: {
        //Auth
        'auth.notAuthorized': 'ไม่มีสิทธิ์เข้าถึงส่วนนี้',
        'auth.roleNotAuthorized': 'ผู้ใช้บทบาท {role} ไม่มีสิทธิ์เข้าถึงส่วนนี้',
        'auth.registerFailed': 'ไม่สามารถลงทะเบียนผู้ใช้ได้',
        'auth.provideEmailPassword': 'กรุณากรอกอีเมลและรหัสผ่าน',
        'auth.invalidCredentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth.loggedOut': 'ออกจากระบบเรียบร้อยแล้ว',
        'auth.profileUpdated': 'แก้ไขข้อมูลส่วนตัวเรียบร้อยแล้ว',
        'auth.updateProfileFailed': 'ไม่สามารถแก้ไขข้อมูลส่วนตัวได้',
        'auth.provideCurrentNewPassword': 'กรุณากรอก currentPassword และ newPassword',
        'auth.currentPasswordIncorrect': 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        'auth.passwordUpdated': 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
        'auth.updatePasswordFailed': 'ไม่สามารถเปลี่ยนรหัสผ่านได้',

        //Massage shop
        'shop.notFound': 'ไม่พบร้านนวดที่มี id {id}',
        'shop.fetchFailed': 'ไม่สามารถค้นหาร้านนวดได้',
        'shop.createFailed': 'ไม่สามารถสร้างร้านนวดได้',
        'shop.updateFailed': 'ไม่สามารถแก้ไขร้านนวดได้',
        'shop.deleteFailed': 'ไม่สามารถลบร้านนวดได้',
        'shop.hasActiveReservations': 'ไม่สามารถลบร้านนวดนี้ได้ เนื่องจากยังมีการจองที่กำลังใช้บริการหรือกำลังจะมาถึงอีก {count} รายการ',
        'shop.deleted': 'ลบร้านนวดเรียบร้อยแล้ว',

        //Package / massage type
        'package.notFound': 'ร้าน {shop} ไม่มีบริการ{type} {duration} นาที',
        'massageType.thai': 'นวดแผนไทย',
        'massageType.oil': 'นวดน้ำมัน',
        'massageType.foot': 'นวดเท้า',
        'massageType.aroma': 'นวดอโรมา',
        'massageType.herbal': 'นวดประคบสมุนไพร',

        //Reservation
        'resv.notFound': 'ไม่พบการจองที่มี id {id}',
        'resv.fetchFailed': 'ไม่สามารถค้นหาการจองได้',
        'resv.createFailed': 'ไม่สามารถสร้างการจองได้',
        'resv.updateFailed': 'ไม่สามารถแก้ไขการจองได้',
        'resv.deleteFailed': 'ไม่สามารถลบการจองได้',
        'resv.missingFields': 'กรุณาระบุ resvDate, massageType และ duration',
        'resv.invalidDate': 'วันที่จองไม่ถูกต้อง',
        'resv.dateInPast': 'วันที่จองต้องเป็นเวลาในอนาคต',
        'resv.outsideHours': 'เวลาจอง (รวมระยะเวลานวด) ต้องอยู่ในเวลาเปิดร้าน {open} - {close}',
        'resv.limitReached': 'ผู้ใช้ ID {id} มีการจองที่ยังไม่สิ้นสุดครบ 3 คิวแล้ว',
        'resv.userNotFound': 'ไม่พบผู้ใช้ที่มี id {id}',
        'resv.notOwnerView': 'ผู้ใช้ {id} ไม่มีสิทธิ์ดูการจองนี้',
        'resv.notOwnerUpdate': 'ผู้ใช้ {id} ไม่มีสิทธิ์แก้ไขการจองนี้',
        'resv.notOwnerDelete': 'ผู้ใช้ {id} ไม่มีสิทธิ์ลบการจองนี้',
        'resv.preview': 'ราคารวม {price} บาท ส่ง body เดิมไปที่ POST /api/v1/massageshops/{shopId}/reservations เพื่อยืนยันการจอง',
        'resv.created': 'ยืนยันการจองเรียบร้อย ราคารวม {price} บาท',
        'resv.updated': 'แก้ไขการจองเรียบร้อย ราคารวม {price} บาท',
        'resv.deleted': 'ลบการจองเรียบร้อยแล้ว',

        //Review
        'review.notFound': 'ไม่พบรีวิวที่มี id {id}',
        'review.fetchFailed': 'ไม่สามารถค้นหารีวิวได้',
        'review.createFailed': 'ไม่สามารถสร้างรีวิวได้',
        'review.updateFailed': 'ไม่สามารถแก้ไขรีวิวได้',
        'review.deleteFailed': 'ไม่สามารถลบรีวิวได้',
        'review.notEligible': 'คุณจะรีวิวร้านนวดได้หลังจากเคยใช้บริการตามที่จองไว้กับร้านนั้นแล้วเท่านั้น',
        'review.alreadyReviewed': 'คุณได้รีวิวร้านนวดนี้ไปแล้ว',
        'review.notOwnerUpdate': 'ผู้ใช้ {id} ไม่มีสิทธิ์แก้ไขรีวิวนี้',
        'review.notOwnerDelete': 'ผู้ใช้ {id} ไม่มีสิทธิ์ลบรีวิวนี้',
        'review.deleted': 'ลบรีวิวเรียบร้อยแล้ว',

        //Favorite
        'fav.fetchFailed': 'ไม่สามารถค้นหาร้านนวดที่ชื่นชอบได้',
        'fav.updateFailed': 'ไม่สามารถแก้ไขรายการร้านนวดที่ชื่นชอบได้',
        'fav.alreadyExists': 'ร้านนวดนี้อยู่ในรายการที่ชื่นชอบแล้ว',
        'fav.notInList': 'ร้านนวดนี้ไม่ได้อยู่ในรายการที่ชื่นชอบ',
        'fav.added': 'เพิ่มในรายการที่ชื่นชอบแล้ว',
        'fav.removed': 'นำออกจากรายการที่ชื่นชอบแล้ว',

        //Notification
        'notif.reminder': 'แจ้งเตือน: คุณมีคิว{type} ({duration} นาที) ที่ร้าน {shop} วันที่ {date}',
        'notif.notFound': 'ไม่พบการแจ้งเตือนที่มี id {id}',
        'notif.notOwner': 'ผู้ใช้ {id} ไม่มีสิทธิ์เข้าถึงการแจ้งเตือนนี้',
        'notif.fetchFailed': 'ไม่สามารถค้นหาการแจ้งเตือนได้',
        'notif.updateFailed': 'ไม่สามารถแก้ไขการแจ้งเตือนได้',
        'notif.deleteFailed': 'ไม่สามารถลบการแจ้งเตือนได้',
        'notif.markedRead': 'ทำเครื่องหมายว่าอ่านแล้ว',
        'notif.allMarkedRead': 'ทำเครื่องหมายว่าอ่านแล้วทั้งหมด',
        'notif.deleted': 'ลบการแจ้งเตือนเรียบร้อยแล้ว',

        //General errors
        'error.duplicate': 'ข้อมูลซ้ำในช่อง: {field}',
        'error.invalidId': 'id ไม่ถูกต้อง: {value}',

        //Validation (used as messages in models)
        'validation.user.nameRequired': 'กรุณากรอกชื่อ',
        'validation.user.telRequired': 'กรุณากรอกเบอร์โทรศัพท์',
        'validation.user.telInvalid': 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)',
        'validation.user.emailRequired': 'กรุณากรอกอีเมล',
        'validation.user.emailInvalid': 'กรุณากรอกอีเมลให้ถูกต้อง',
        'validation.user.passwordRequired': 'กรุณากรอกรหัสผ่าน',
        'validation.user.passwordMin': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'validation.user.languageEnum': 'ภาษาต้องเป็น th หรือ en เท่านั้น',
        'validation.shop.nameRequired': 'กรุณากรอกชื่อร้าน',
        'validation.shop.nameMax': 'ชื่อร้านต้องไม่เกิน 50 ตัวอักษร',
        'validation.shop.addressRequired': 'กรุณากรอกที่อยู่',
        'validation.shop.telRequired': 'กรุณากรอกเบอร์โทรศัพท์',
        'validation.shop.openTimeRequired': 'กรุณากรอกเวลาเปิด',
        'validation.shop.closeTimeRequired': 'กรุณากรอกเวลาปิด',
        'validation.shop.timeInvalid': 'เวลาต้องอยู่ในรูปแบบ HH:mm (เช่น 09:00)',
        'validation.shop.packagesRequired': 'กรุณาเพิ่มแพ็กเกจนวดอย่างน้อย 1 รายการ',
        'validation.package.massageTypeRequired': 'กรุณาระบุประเภทการนวด',
        'validation.package.massageTypeEnum': 'ประเภทการนวดต้องเป็น thai, oil, foot, aroma หรือ herbal',
        'validation.package.durationRequired': 'กรุณาระบุระยะเวลา (นาที)',
        'validation.package.durationMin': 'ระยะเวลาต้องไม่น้อยกว่า 15 นาที',
        'validation.package.priceRequired': 'กรุณาระบุราคา',
        'validation.package.priceMin': 'ราคาต้องไม่ติดลบ',
        'validation.resv.dateRequired': 'กรุณาระบุวันที่จอง',
        'validation.review.ratingRequired': 'กรุณาให้คะแนน 1 ถึง 5',
        'validation.review.ratingRange': 'คะแนนต้องอยู่ระหว่าง 1 ถึง 5',
        'validation.review.commentMax': 'ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร'
    }
};

//Find which language this request should use
const getLang = (req) => {
    const queryLang = req.query && req.query.lang;
    if (SUPPORTED_LANGUAGES.includes(queryLang)) {
        return queryLang;
    }

    if (req.user && SUPPORTED_LANGUAGES.includes(req.user.language)) {
        return req.user.language;
    }

    const header = req.headers && req.headers['accept-language'];
    if (header && header.toLowerCase().startsWith('th')) {
        return 'th';
    }

    return 'en';
};

//Translate a message key, e.g. t(req,'shop.notFound',{id:'123'})
const t = (req, key, params = {}) => {
    const lang = getLang(req);
    const template = messages[lang][key] || messages.en[key] || key;

    return template.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] !== undefined ? params[name] : match
    );
};

//Translated label of a massage type, e.g. 'thai' -> 'Thai massage' / 'นวดแผนไทย'
const massageTypeLabel = (req, massageType) => t(req, `massageType.${massageType}`);

//Format a date for the user's language in the shop timezone
const formatDate = (req, date) => {
    const locale = getLang(req) === 'th' ? 'th-TH' : 'en-GB';
    return new Date(date).toLocaleString(locale, {
        timeZone: process.env.SHOP_TIMEZONE || 'Asia/Bangkok',
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

module.exports = { SUPPORTED_LANGUAGES, getLang, t, massageTypeLabel, formatDate };
