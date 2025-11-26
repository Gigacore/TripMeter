import Papa, { ParseResult } from 'papaparse';

export interface CSVRow {
  [key: string]: any;
}

export const parseCSV = (file: File): Promise<ParseResult<CSVRow>> => {
    return new Promise((resolve, reject) => {
        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: ParseResult<CSVRow>) => resolve(results),
            error: (err: Error) => reject(err)
        });
    });
};