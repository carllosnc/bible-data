import { describe, it, expect } from "bun:test";
import { getProtestantBookName, protestantBookNamesMap } from "../protestant/books";
import { getCatholicBookName, catholicBookNamesMap } from "../catholic/books";
import rawProtestantVersions from "../protestant/version.json";
import type { VersionGroup } from "../types";

const protestantVersions = rawProtestantVersions as unknown as VersionGroup[];

describe("Native Book Names Mapping - Protestant", () => {
  it("defines native book names for all supported languages", () => {
    for (const group of protestantVersions) {
      const langCode = Object.keys(group).find(k => k !== 'name' && k !== 'category')!;
      expect(protestantBookNamesMap[langCode]).toBeDefined();
      expect(Object.keys(protestantBookNamesMap[langCode]).length).toBeGreaterThan(0);
    }
  });

  it("returns native name for Greek New Testament (byz1904 / mt)", () => {
    const mtName = getProtestantBookName("gr", "mt");
    expect(mtName).toBe("ΚΑΤΑ ΜΑΤΘΑΙΟΝ");
  });

  it("returns native name for English Genesis (asv / gn)", () => {
    const gnName = getProtestantBookName("en", "gn");
    expect(gnName).toBe("Genesis");
  });

  it("returns native name for Chinese Matthew (csbs / mt)", () => {
    const mtName = getProtestantBookName("zh", "mt");
    expect(mtName).toBe("马太福音");
  });

  it("returns native name for German Matthew (luther1912 / mt)", () => {
    const mtName = getProtestantBookName("de", "mt");
    expect(mtName).toBe("Matthäus");
  });

  it("returns native name for Spanish Matthew (rv / mt)", () => {
    const mtName = getProtestantBookName("es", "mt");
    expect(mtName).toBe("Mateo");
  });

  it("returns native name for French Matthew (lsg / mt)", () => {
    const mtName = getProtestantBookName("fr", "mt");
    expect(mtName).toBe("Évangile selon Matthieu");
  });

  it("does not return Portuguese 'Mateus' for Greek 'mt'", () => {
    const mtName = getProtestantBookName("gr", "mt");
    expect(mtName).not.toBe("Mateus");
  });

  it("does not return Portuguese 'Gênesis' for English 'gn'", () => {
    const gnName = getProtestantBookName("en", "gn");
    expect(gnName).not.toBe("Gênesis");
  });
});

describe("Native Book Names Mapping - Catholic", () => {
  it("defines native book names for all supported languages with a book list", () => {
    const supportedLangs = Object.keys(catholicBookNamesMap);
    expect(supportedLangs.length).toBeGreaterThanOrEqual(12);
    for (const lang of supportedLangs) {
      expect(Object.keys(catholicBookNamesMap[lang]).length).toBe(73);
    }
  });

  it("returns native name for Portuguese Genesis (biblia-ave-maria / genesis)", () => {
    const name = getCatholicBookName("pt-BR", "genesis");
    expect(name).toBe("Gênesis");
  });

  it("returns native name for English Matthew (the-new-american-bible / matthew)", () => {
    const name = getCatholicBookName("en", "matthew");
    expect(name).toBe("Matthew");
  });

  it("returns native name for Spanish Genesis (la-biblia-de-jerusalen / genesis)", () => {
    const name = getCatholicBookName("es", "genesis");
    expect(name).toBe("Génesis");
  });

  it("returns native name for Latin Genesis (vulgata-latina / liber-genesis)", () => {
    const name = getCatholicBookName("la", "liber-genesis");
    expect(name).toBe("Liber Genesis");
  });

  it("returns native name for Polish Genesis (biblia-tysiaclecia / ksiega-rodzaju)", () => {
    const name = getCatholicBookName("pl", "ksiega-rodzaju");
    expect(name).toBe("Księga Rodzaju");
  });

  it("returns native name for Hungarian Matthew (katolikus-biblia / mate-evangeliuma)", () => {
    const name = getCatholicBookName("hu", "mate-evangeliuma");
    expect(name).toBe("Máté evangéliuma");
  });

  it("returns native name for Finnish Psalms (raamattu-ja-biblia / psalmit)", () => {
    const name = getCatholicBookName("fi", "psalmit");
    expect(name).toBe("Psalmit");
  });

  it("returns native name for Croatian Genesis (biblija-hrvatski / knjiga-postanka)", () => {
    const name = getCatholicBookName("hr", "knjiga-postanka");
    expect(name).toBe("Knjiga Postanka");
  });

  it("does not return Portuguese 'Gênesis' for English 'genesis'", () => {
    const name = getCatholicBookName("en", "genesis");
    expect(name).not.toBe("Gênesis");
  });

  it("does not return Portuguese 'Gênesis' for Polish 'ksiega-rodzaju'", () => {
    const name = getCatholicBookName("pl", "ksiega-rodzaju");
    expect(name).not.toBe("Gênesis");
  });
});
