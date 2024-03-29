export function anyItemIsInList<T>(items: T[], list: T[]) {
    return items.some(item => list.includes(item));
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function onlyUniqueFilter<T>(value: T, index: number, array: T[]) {
    return array.indexOf(value) === index;
}

export function onlyUniqueInsFilter(value: string, index: number, array: string[]) {
    return array.findIndex(item => item.toLowerCase() === value.toLowerCase()) === index;
}

export function chunkSubstr(str: string, size: number) {
    const chunks = [];

    if (str.length < size) return [str];

    while (str.length > 0) {
        const tmp = str.substring(0, size);
        const indexOfLastNewLine = tmp.lastIndexOf("\n");
        const chunkLength = indexOfLastNewLine > 0 ? indexOfLastNewLine + 1 : size;
        chunks.push(tmp.substring(0, chunkLength));
        str = str.substring(chunkLength);
    }

    return chunks;
}

export function stripCustomMarkup(text: string): string {
    return text.replaceAll(/#./g, "");
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce(func: Function, delay: number): (...args: any[]) => void {
    let timeoutId: string | number | NodeJS.Timeout;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            // eslint-disable-next-line prefer-rest-params
            func(...args);
        }, delay);
    };
}
