# Career Nearest-Neighbor Audit

The audit compares separate Talent, RIASEC Interest, Work Style, Environment, and matched Values vectors, plus the combined 46-dimensional vector. Values below are cosine similarity rounded to three decimals.

| # | Career pair | Same family | Talent | Interest | Work style | Environment | Values | Overall |
| ---: | --- | :---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Data Analyst / Financial Analyst | No | .915 | .999 | .994 | .984 | .998 | .967 |
| 2 | Electrician / Aviation Maintenance Technician | Yes | .893 | .998 | .940 | .993 | .926 | .951 |
| 3 | People Operations / Research Operations | No | .875 | .988 | .997 | .982 | .922 | .947 |
| 4 | People Operations / School Program Coordinator | No | .867 | .968 | .983 | .972 | .969 | .945 |
| 5 | Product Operations / People Operations | No | .857 | .986 | .990 | .973 | .976 | .945 |
| 6 | Product Operations / Project Manager | No | .836 | .990 | .997 | .978 | .995 | .943 |
| 7 | Implementation Specialist / Research Operations | No | .985 | .996 | .880 | .928 | .839 | .933 |
| 8 | Solutions Consultant / Management Consultant | No | .983 | .846 | .827 | .964 | .992 | .931 |
| 9 | Tour Operations / Clinical Research Coordinator | No | .842 | .997 | .929 | .980 | .946 | .931 |
| 10 | Product Operations / School Program Coordinator | No | .851 | .913 | .997 | .961 | .989 | .931 |
| 11 | Environmental Engineer / Aviation Maintenance Technician | No | .842 | .953 | .921 | .985 | .967 | .930 |
| 12 | Product Operations / Research Operations | No | .846 | .999 | .993 | .974 | .868 | .929 |
| 13 | Hotel Operations Manager / Emergency Management Specialist | No | .863 | .976 | .887 | .965 | .953 | .929 |
| 14 | School Program Coordinator / Project Manager | No | .820 | .961 | .998 | .964 | .972 | .926 |
| 15 | Product Analyst / Market Researcher | No | .857 | .859 | .996 | .973 | .998 | .923 |
| 16 | Electrician / CNC Technician | Yes | .733 | .979 | .999 | .973 | .981 | .922 |
| 17 | Financial Analyst / Industrial Engineer | No | .870 | .968 | .859 | .944 | .987 | .919 |
| 18 | Cybersecurity Analyst / Risk & Compliance Analyst | No | .808 | 1.000 | .889 | .965 | .980 | .918 |
| 19 | People Operations / Clinical Research Coordinator | No | .732 | .994 | .999 | .979 | .945 | .917 |
| 20 | Data Analyst / Industrial Engineer | No | .868 | .964 | .841 | .951 | .995 | .915 |

## Review

The highest pair is below 0.98, but the audit reveals that broad RIASEC and matched Values are intentionally coarse and can be highly similar. Data Analyst and Financial Analyst remain differentiated mainly by Talent emphasis, tasks, domain skills, and Entry Distance; this pair should be monitored during real-user calibration. Operational roles also cluster, but their Talent, risk, emotional-labor, mobility, and entry requirements remain distinct.

All three careers in every family are checked pairwise by test; no same-family pair reaches 0.98. The closest same-family pair is Electrician / Aviation Maintenance Technician at 0.951, followed by Electrician / CNC Technician at 0.922. Their licensing, risk, system scope, and core tasks prevent them from being interchangeable.

Family membership never changes Career Fit. It is read only when constructing a diverse Surprise list.
