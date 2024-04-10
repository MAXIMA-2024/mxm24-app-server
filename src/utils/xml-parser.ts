import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

const parseXML = <T>(xml: string) => {
  return parser.parse(xml) as T;
};

export default parseXML;
