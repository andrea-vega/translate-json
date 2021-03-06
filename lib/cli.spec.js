const minimist = require("minimist")

const { getOptions, STDIN, STDOUT } = require("./cli")
const { errors } = require("../strings.json")

describe("command line interface", () => {
  describe("source and destination arguments", () => {
    it("interprets 'stdin' as './stdin' and not Symbol(stdin)", () => {
      const m = minimist("-l se stdin".split(" "))
      expect(getOptions(m).source).toBe("stdin")
    })

    it("interprets '-' as 'Symbol(stdin)'", () => {
      const m = minimist("-l se -".split(" "))
      expect(getOptions(m).source).toBe(STDIN)
    })

    it("interprets 'stdout' as './stdout' and not 'Symbol(stdout)'", () => {
      const m = minimist("-l se stdin stdout".split(" "))
      expect(getOptions(m).source).toBe("stdin")
      expect(getOptions(m).destination).toBe("stdout")
    })

    it("defaults omitted output to 'Symbol(stdout)'", () => {
      const m = minimist("-l se -".split(" "))
      expect(getOptions(m).source).toBe(STDIN)
      expect(getOptions(m).destination).toBe(STDOUT)
    })

    it("can use '-' with file output", () => {
      const m = minimist("-l se - output".split(" "))
      expect(getOptions(m).source).toBe(STDIN)
      expect(getOptions(m).destination).toBe("output")
    })

    it("throws when no source is specified", () => {
      const m = minimist("-l ru".split(" "))
      expect(() => getOptions(m)).toThrowError(errors.MISSING_SOURCE)
    })
  })

  describe("language arguments", () => {
    it("errors if no language argument is given", () => {
      const m = minimist("a")
      expect(() => getOptions(m)).toThrowError(errors.MISSING_LANGUAGE)
    })
    it("-l ru input", () => {
      const m = minimist("-l ru input".split(" "))
      expect(getOptions(m).lang).toBe("ru")
    })
    it("-l gb input", () => {
      const m = minimist("-l gb input".split(" "))
      expect(getOptions(m).lang).toBe("gb")
    })
    it("-l ie input", () => {
      const m = minimist("-l ie input".split(" "))
      expect(getOptions(m).lang).toBe("ie")
    })
  })

  describe("api arguments", () => {
    it("defaults to google", () => {
      const m = minimist("-l foo input".split(" "))
      const { api, apiKey } = getOptions(m)
      expect(api).toEqual("google")
      expect(apiKey).toBeUndefined()
    })
    it("--translator yandex --api-key abc123", () => {
      const m = minimist(
        "-l foo input --translator yandex --api-key abc123".split(" ")
      )
      const { api, apiKey } = getOptions(m)
      expect(api).toEqual("yandex")
      expect(apiKey).toEqual("abc123")
    })
    it("--t yandex -k def456", () => {
      const m = minimist("-l foo input --t yandex -k def456".split(" "))
      const { api, apiKey } = getOptions(m)
      expect(api).toEqual("yandex")
      expect(apiKey).toEqual("def456")
    })
  })

  it("throws an error when an invalid language is passed.", () => {
    const m = minimist("-t abc -".split(" "))

    expect(() => getOptions(m)).toThrow(errors.INVALID_TRANSLATOR)
  })

  it("throws an error when Bing is chosen as a translator but no API key is provided", () => {
    const m = minimist("-t bing -".split(" "))
    expect(() => getOptions(m)).toThrow(
      errors.REQUIRED_PARAM_API_KEY.replace("%s", "bing")
    )
  })

  it("throws an error when Yandex is chosen as a translator but no API key is provided", () => {
    const m = minimist("-t yandex -".split(" "))
    expect(() => getOptions(m)).toThrow(
      errors.REQUIRED_PARAM_API_KEY.replace("%s", "yandex")
    )
  })

  it("Google translator does not require an API key", () => {
    const m = minimist("-l fr -t google -".split(" "))
    const opts = getOptions(m)
    expect(opts.api).toEqual("google")
    expect(opts.apiKey).toBeUndefined()
  })
})
