export class HelperPage {
  async generateRandomString(length) {
    let RandomString = "";
    const CharactersRange =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzßöäüÖÄÜ";
    const CharactersRangeLength = CharactersRange.length;
    let counter = 0;

    while (counter < length) {
      RandomString += CharactersRange.charAt(
        Math.floor(Math.random() * CharactersRangeLength)
      );
      counter += 1;
    }
    return RandomString;
  }
}
