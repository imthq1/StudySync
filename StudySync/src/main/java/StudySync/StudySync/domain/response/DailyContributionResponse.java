package StudySync.StudySync.domain.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DailyContributionResponse {
    private LocalDate date;
    private long count;
}
