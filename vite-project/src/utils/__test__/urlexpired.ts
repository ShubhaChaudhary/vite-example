
import { hasSignedExpired } from '../aws';

describe('hasSignedExpired', () => {
  test('returns true when X-Amz-Date is in past', () => {
    const url =
      'https://dev-postprocessing-out.s3.us-west-2.amazonaws.com/G4115839485/1190314459023429635.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASH6O22JHISGLZ2OJ%2F20221129%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20221129T224033Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIQC5QG24BnIyCvSItICxHuNPwEW3ZPc5CYfyAmXLCdDO%2BgIgX9Vj5b5KsDK9keS2gOFffUuUHty0re0eBrJItbk6a10qzAQIaBADGgwxNTQ1MTU3MjI4MzAiDPDss%2FwcLOH%2FmJdtviqpBDI0WdRjSNj5a7BcK2yHK04ZkB%2FcixlavpfAdz4wWwN3tPvOb%2B8KG14dxsKAJK%2BasW6fSlgO5kGyMpamQyLopWD%2F7E0BWq3eNi%2F7B06fNLDwDE37YGyX8yrM%2BWt1Qt%2FBJ2OBRg7tIWx%2FvnyzKXMKc0OVuy3lf2zfljqBIK%2BqyZhWQD7cHg4AuztfvEOyVtn2G3czlFsB19rz5nWRxuKcuI9dC1ynPJf5fQuBPXrTizMDpzMk9WtzaiqVC7yywN0%2F3tNZ0l50rWLN5waLEoiY3c1pYj7iLGNVJF7qCXCi6K0qY%2BUHpqebR6rzMqPHEHVi0p%2FTCgHwp0aqYCdjHHmg%2F8D6%2B742v4MzW10Cm2NGhpUxrcdHhrvslkQpH%2FMcbiahrBXf8bx0vav0mvthvbyD%2B8qgTIscAjsV6lCsCWJsTl0nJs%2Fo6QM8hYC7lmw3EPmfCO%2BEv0Smoxk6cah5ln1amfIPwi7Xdgcw9mo2MF6po42ZlvZ9FPn2ecDWEtW%2BTonr9XVgbdPaOBa8MVzU0PuqDhnXNpnzI6273O45aFAPzF0nL5omoXkcuFNKDqAPpZ5LYnq6HpFzXHB3rGB2bLL8PxSG0Q6BQZRXheGMcLyRn9HPaeMZedq5waT66B49KqkXdue5FGvgo8y5WkvmVomI9Q3Wi7WB7HqSg8F2C8rQ2RxVev%2Bl2Ml0nVQCHHcDjvZmzqfreACayc3ZF%2B4eAm6EI%2F8ocj1m3eLNPF0wn42anAY6qQGW1g87OkYOLBXkIqBL5S70FlMrO3UtHRxLUZftKsoEpWJHceYwajybW5ETs9c8fR0zK2lT%2BUByhgf4bHm%2FWf4QEdL6HZGi9lxp3K6myJ6fvABcPvdcs%2Bps7K59e%2FmJA3vqgoTUS8WGqz3BETUbuDAw0oZm1bCc4FZyliDBNIucem%2BI1KNaBCkTJrYqtkOM9qR4iQY%2BQBg2AdaBgXcc8ye%2BdkWjSbylX5Mp&X-Amz-SignedHeaders=host&X-Amz-Signature=5a032251b55ddb1b3e6f4';
    expect(hasSignedExpired(url)).toEqual(true);
  });

  test('returns false when X-Amz-Date is not in past', () => {
    const date = new Date().toJSON().replace(/[^a-zA-Z0-9 ]/g, '');
    const url = `https://dev-postprocessing-out.s3.us-west-2.amazonaws.com/G4115839485/1190314459023429635.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIASH6O22JHISGLZ2OJ%2F20221129%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=${date}&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIQC5QG24BnIyCvSItICxHuNPwEW3ZPc5CYfyAmXLCdDO%2BgIgX9Vj5b5KsDK9keS2gOFffUuUHty0re0eBrJItbk6a10qzAQIaBADGgwxNTQ1MTU3MjI4MzAiDPDss%2FwcLOH%2FmJdtviqpBDI0WdRjSNj5a7BcK2yHK04ZkB%2FcixlavpfAdz4wWwN3tPvOb%2B8KG14dxsKAJK%2BasW6fSlgO5kGyMpamQyLopWD%2F7E0BWq3eNi%2F7B06fNLDwDE37YGyX8yrM%2BWt1Qt%2FBJ2OBRg7tIWx%2FvnyzKXMKc0OVuy3lf2zfljqBIK%2BqyZhWQD7cHg4AuztfvEOyVtn2G3czlFsB19rz5nWRxuKcuI9dC1ynPJf5fQuBPXrTizMDpzMk9WtzaiqVC7yywN0%2F3tNZ0l50rWLN5waLEoiY3c1pYj7iLGNVJF7qCXCi6K0qY%2BUHpqebR6rzMqPHEHVi0p%2FTCgHwp0aqYCdjHHmg%2F8D6%2B742v4MzW10Cm2NGhpUxrcdHhrvslkQpH%2FMcbiahrBXf8bx0vav0mvthvbyD%2B8qgTIscAjsV6lCsCWJsTl0nJs%2Fo6QM8hYC7lmw3EPmfCO%2BEv0Smoxk6cah5ln1amfIPwi7Xdgcw9mo2MF6po42ZlvZ9FPn2ecDWEtW%2BTonr9XVgbdPaOBa8MVzU0PuqDhnXNpnzI6273O45aFAPzF0nL5omoXkcuFNKDqAPpZ5LYnq6HpFzXHB3rGB2bLL8PxSG0Q6BQZRXheGMcLyRn9HPaeMZedq5waT66B49KqkXdue5FGvgo8y5WkvmVomI9Q3Wi7WB7HqSg8F2C8rQ2RxVev%2Bl2Ml0nVQCHHcDjvZmzqfreACayc3ZF%2B4eAm6EI%2F8ocj1m3eLNPF0wn42anAY6qQGW1g87OkYOLBXkIqBL5S70FlMrO3UtHRxLUZftKsoEpWJHceYwajybW5ETs9c8fR0zK2lT%2BUByhgf4bHm%2FWf4QEdL6HZGi9lxp3K6myJ6fvABcPvdcs%2Bps7K59e%2FmJA3vqgoTUS8WGqz3BETUbuDAw0oZm1bCc4FZyliDBNIucem%2BI1KNaBCkTJrYqtkOM9qR4iQY%2BQBg2AdaBgXcc8ye%2BdkWjSbylX5Mp&X-Amz-SignedHeaders=host&X-Amz-Signature=5a032251b55ddb1b3e6f4306633d6d49566`;
    expect(hasSignedExpired(url)).toEqual(false);
  });
});