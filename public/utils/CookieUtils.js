export default class CookieUtils {
  static setCookie(name, value) {
    let twoWeeksInSeconds = 60 * 60 * 24 * 14;
    document.cookie = `${name}=${value}; path=/; max-age=${twoWeeksInSeconds}`;
  }

  static getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
}
