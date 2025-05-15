import { CancellationToken, Event, EventEmitter, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, OutputChannel, ProviderResult, TextDocument } from 'vscode';

class Folder implements FoldingRangeProvider {
	private writeTo: OutputChannel;

	constructor(channel: OutputChannel) {
		this.writeTo = channel;
	}

	private _onDidChangeFoldingRanges  = new EventEmitter<void>();
	get onDidChangeFoldingRanges() : Event<void> {
		return this._onDidChangeFoldingRanges.event;
	}

	provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): ProviderResult<FoldingRange[]> {
		// this.writeTo.appendLine("asked to provide folding ranges for " + document.fileName);
		// this.writeTo.appendLine("line count = " + document.lineCount);
		// this.writeTo.appendLine("line 0 = " + document.lineAt(0).text);

		const foldingRanges: FoldingRange[] = [];
		var beginRange = -1;
		for (var line=0;line<document.lineCount;line++) {
			var tx = document.lineAt(line).text;
			var ind = figureIndent(tx);
			// this.writeTo.appendLine("line " + line + " ind " + ind.length + ": " + tx);
			if (ind.length > 0 && beginRange == -1) {
				beginRange = line;
			} else if (ind.length == 0 && beginRange != -1) {
				foldingRanges.push(new FoldingRange(beginRange, line-1));
				beginRange = -1
			}
		}
		if (beginRange != -1) {
			foldingRanges.push(new FoldingRange(beginRange, document.lineCount-1));
		}
		// this.writeTo.appendLine("returning " + foldingRanges.length);
		// for (var i=0;i<foldingRanges.length;i++) {
		// 	this.writeTo.appendLine(i + " == " + foldingRanges[i].start + " - " + foldingRanges[i].end);
		// }
		return foldingRanges;
	}
}

function figureIndent(s: string) : string {
	var ind = "";
	for (var i=0;i<s.length && /\s/.test(s.substring(i, i+1));i++) {
		ind = s.substring(0, i+1)
	}
	return ind
}

export { Folder }
