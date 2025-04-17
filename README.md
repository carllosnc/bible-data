# Bible Data

>Extract content from [Biblia online](https://www.bibliaonline.com.br/vc) and transform to Json and gzip and Sqlite.

### Json Format
```json
{
  lang: string
  books: {
    [
      {
        name: string,
        link: string,
        abbrev: string,
        testament: number
        chapters: [[string]]
      }
    ]
  }
}
```

---

Carlos Costa @ 2025
