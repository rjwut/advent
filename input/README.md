# `/input`

Input downloaded from the Advent of Code web site is cached here. Because this data is unique per user, it is not included in the repository. In order to enable automatic input download, you must run:

```bash
npm run session <session-cookie>
```

...where `session-cookie` is the value of your `session` cookie from the Advent of Code web site. This cookie will be stored in `input/.session`. If you prefer not to do that, you can instead retrieve your input yourself and save it to `input/{year}/{day}.txt`.
