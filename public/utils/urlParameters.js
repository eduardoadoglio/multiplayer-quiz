export default class UrlParameters {
  static getAllUrlParameters() {
    let searchPageURL = window.location.search.substring(1);
    console.log(`searchPageURL = ${searchPageURL}`);
    let searchURLVariables = searchPageURL.split("&");
    let searchParameterName;
    let urlParameters = {};
    for (let i = 0; i < searchURLVariables.length; i++) {
      searchParameterName = searchURLVariables[i].split("=");
      if (searchParameterName[1] !== undefined) {
        urlParameters[searchParameterName[0]] = decodeURIComponent(
          searchParameterName[1].replace(/\+/g, " ")
        );
      }
    }
    return urlParameters;
  }

  static getUrlParameter(searchParam) {
    let searchPageURL = window.location.search.substring(1);
    let searchURLVariables = searchPageURL.split("&");
    let searchParameterName;

    for (let i = 0; i < searchURLVariables.length; i++) {
      searchParameterName = searchURLVariables[i].split("=");

      if (searchParameterName[0] === searchParam) {
        return typeof searchParameterName[1] === undefined
          ? null
          : decodeURIComponent(searchParameterName[1].replace(/\+/g, " "));
      }
    }
    return null;
  }
}
