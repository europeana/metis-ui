import { problemPatternData } from '../../src/app/_data';
import { ProblemPattern, ProblemPatternId } from '../../src/app/_models';

/**
 * generateProblem
 *
 * @param ( number ) datasetId
 * @param ( number ) patternIdIndex
 * @param ( string ) recordId
 **/
export function generateProblem(
  datasetId: number,
  patternIdIndex: number,
  recordId?: string
): ProblemPattern {
  const messageReports = {
    P1: ['My Title', 'My Other Title', "Can't people think of original titles?"],
    P2: [
      'The Descriptive Title',
      `The Descriptive Title: when all the good titles were taken
     they inevitably started to evolve into titles that were
     more descriptive in syntax.`,
      'The Descriptive Title: 2-in-1'
    ],
    P3: ['Cultural Heritage Object'],
    P5: ['**$!^#-_-#^!$**', 'xxxxxxxxxxxx'],
    P6: ['aaaaaaa', 'zzzzzzz'],
    P7: ['', '/', '/na'],
    P9: ['Title', 'A1'],
    P12: [
      `This value is 255 characters long, which is the maximum length it can be.
     This means that this value – shown in light yellow – can occupy a lot of
     real estate.  It will line-wrap, though how often it line-wraps would depend
     on the width of its container.`
    ]
  };

  let indexMatch = -1;

  const patternIds = [1, 2, 3, 5, 6, 7, 9, 12].map((id: number, index: number) => {
    if (recordId && recordId.indexOf(`${id}`) === 0) {
      indexMatch = index;
    }
    return `P${id}` as ProblemPatternId;
  });

  const resultId = patternIds[indexMatch > -1 ? indexMatch : patternIdIndex % patternIds.length];

  let occurrenceCount = Math.max(1, (datasetId + patternIdIndex) % 4);

  if (recordId && recordId.indexOf('x') > -1) {
    const index = recordId.indexOf('x') + 1;
    const multiplier = parseInt(recordId.substring(index, index + recordId.length));
    if (!isNaN(multiplier)) {
      occurrenceCount = occurrenceCount * multiplier;
    }
  } else if (resultId === 'P1' && patternIdIndex === 0) {
    occurrenceCount += 1;
  }

  const occurenceList = [...Array(occurrenceCount).keys()].map((_, occurenceIndex) => {
    const messageReportGroup = messageReports[resultId];
    return {
      recordId: recordId ? decodeURIComponent(recordId) : '/X/generated-record-id',
      problemOccurrenceList: [
        {
          messageReport: messageReportGroup[occurenceIndex % messageReportGroup.length],
          affectedRecordIds: [...Array((occurenceIndex % 5) + 2).keys()].map((i, index) => {
            let suffix = '';
            if ((occurenceIndex + index) % 2 > 0) {
              suffix = '/artificially-long-to-test-line-wrapping-within-the-affected-records-list';
            }
            return `/${datasetId}/${occurenceIndex}${i}/${suffix}`;
          })
        }
      ]
    };
  });

  return {
    problemPatternDescription: {
      problemPatternId: resultId,
      problemPatternSeverity: problemPatternData[resultId].problemPatternSeverity,
      problemPatternQualityDimension: problemPatternData[resultId].problemPatternQualityDimension,
      problemPatternTitle: problemPatternData[resultId].problemPatternTitle
    },
    recordOccurrences: occurenceList.length,
    recordAnalysisList: occurenceList
  } as ProblemPattern;
}
