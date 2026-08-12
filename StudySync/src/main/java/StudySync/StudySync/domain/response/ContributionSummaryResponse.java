package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ContributionSummaryResponse {
    private long total;
    private long postCount;
    private long commentCount;
    private long activeDays;
    private List<DailyContributionResponse> days;
}
