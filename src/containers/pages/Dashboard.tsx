import { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import colors from "tailwindcss/colors";
import moment from "moment";

import { useAuth } from "../../lib/auth";
import { useSelector } from "../../redux/store";

export type Stats = { date: Date; count: number };

export default function Dashboard() {
  const themeMode = useSelector((state) => state.app.themeMode);
  const refreshDashboard = useSelector((state) => state.app.refreshDashboard);
  const auth = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRoles, setTotalRoles] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [signupData, setSignupData] = useState<Stats[]>([]);
  const [loginData, setLoginData] = useState<Stats[]>([]);

  useEffect(() => {
    auth
      .createAdminApi()
      .v1AdminUsersGet({ countOnly: true })
      .then((res) => {
        setTotalUsers(res.data.data.count);
      });
    auth
      .createAdminApi()
      .v1AdminRolesGet({ countOnly: true })
      .then((res) => {
        setTotalRoles(res.data.data.count);
      });
    auth
      .createAdminApi()
      .v1AdminGroupsGet({ countOnly: true })
      .then((res) => {
        setTotalGroups(res.data.data.count);
      });

    auth
      .createAdminApi()
      .v1AdminEventLogsStatsGet({
        offset: -new Date().getTimezoneOffset(),
        from: moment().startOf("month").toISOString(),
        // End of week could be later than end of month
        to: moment().endOf("week").isAfter(moment().endOf("month"))
          ? moment().endOf("week").toISOString()
          : moment().endOf("month").toISOString(),
      })
      .then((res) => {
        // Signup
        const signupData: Stats[] = Array.from(
          new Array(moment().daysInMonth())
        ).map((_, day) => ({
          date: moment()
            .startOf("month")
            .date(day + 1)
            .toDate(),
          count: 0,
        }));
        const signupStats = res.data.data.data.filter((s) =>
          s.type.startsWith("signup")
        );
        for (const stats of signupStats) {
          const daysDiff = moment(stats.createdAt).diff(
            moment().startOf("month"),
            "days"
          );
          if (daysDiff >= 0 && daysDiff < signupData.length) {
            signupData[daysDiff].count += stats.count;
          }
        }
        setSignupData(signupData);

        // Login
        const loginData: Stats[] = Array.from(
          new Array(moment().daysInMonth())
        ).map((_, day) => ({
          date: moment()
            .startOf("month")
            .date(day + 1)
            .toDate(),
          count: 0,
        }));
        const loginStats = res.data.data.data.filter(
          (s) => s.type === "user.login.succeeded"
        );
        for (const stats of loginStats) {
          const daysDiff = Math.floor(
            moment(stats.createdAt).diff(
              moment().startOf("month"),
              "days",
              true
            )
          );
          if (daysDiff >= 0 && daysDiff < loginData.length) {
            loginData[daysDiff].count += stats.count;
          }
        }
        setLoginData(loginData);
      });
  }, [auth, refreshDashboard]);

  function createBarChart(data: Stats[], props?: ApexOptions) {
    const height = 200;
    const thisMonthsData = data.filter((d) =>
      moment(d.date).isSame(moment(), "month")
    );
    return (
      <ReactApexChart
        type="bar"
        height={height}
        series={[
          {
            name: "",
            data: thisMonthsData.map((d) => d.count),
          },
        ]}
        options={{
          chart: {
            type: "bar",
            height,
            toolbar: {
              show: false,
            },
            // sparkline: {
            //   // Remove top/bottom padding
            //   enabled: true,
            // },
          },
          colors: [colors.sky[themeMode === "light" ? 900 : 300]],
          plotOptions: {
            bar: {},
          },
          grid: {
            show: false,
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 10,
            },
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: true,
              strokeWidth: 1,
              color: colors.neutral[themeMode === "light" ? 300 : 700],
            },
            tickAmount: 10,
            labels: {
              rotateAlways: true,
              style: {
                fontSize: "10px",
                colors: colors.neutral[themeMode === "light" ? 500 : 400],
              },
            },
            categories: Array.from(new Array(moment().daysInMonth())).map(
              (_, index) =>
                moment()
                  .startOf("month")
                  .date(index + 1)
                  .format("Do")
            ),
          },
          yaxis: {
            show: false,
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return `${val}`;
              },
            },
          },
        }}
        {...props}
      />
    );
  }

  function formatNumber(num: number) {
    let str = `${num}`;
    const len = str.length;
    for (let i = 3; i < len; i += 3) {
      const index = str.length - (i + (i - 3) / 3);
      str = `${str.slice(0, index)},${str.slice(index)}`;
    }
    return str;
  }

  function getDataByMonthWeekDay(data: Stats[]) {
    let thisMonth = 0;
    let thisWeek = 0;
    let today = 0;
    for (const datum of data) {
      if (moment(datum.date).isSame(moment(), "month")) {
        thisMonth += datum.count;
      }
      if (moment(datum.date).isSame(moment(), "week")) {
        thisWeek += datum.count;
      }
      if (moment(datum.date).isSame(moment(), "day")) {
        today += datum.count;
      }
    }
    return { thisMonth, thisWeek, today };
  }

  const logins = getDataByMonthWeekDay(loginData);
  const signups = getDataByMonthWeekDay(signupData);

  return (
    <>
      {/* Total */}
      <div className="flex flex-row gap-4">
        <div className="paper flex-1 p-6">
          <div className="text text-dim text-lg text-center">Total Users</div>
          <div className="text text-4xl text-center mt-4">
            {formatNumber(totalUsers)}
          </div>
        </div>
        <div className="paper flex-1 p-6">
          <div className="text text-dim text-lg text-center">Total Roles</div>
          <div className="text text-4xl text-center mt-4">
            {formatNumber(totalRoles)}
          </div>
        </div>
        <div className="paper flex-1 p-6">
          <div className="text text-dim text-lg text-center">Total Groups</div>
          <div className="text text-4xl text-center mt-4">
            {formatNumber(totalGroups)}
          </div>
        </div>
      </div>
      <div className="h-4" />

      {/* Signups/Logins */}
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="paper py-5 px-6">
            <div className="text text-lg text-dim mb-6">Total Signups</div>
            <div className="flex flex-row gap-2">
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(signups.thisMonth)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  this month
                </div>
              </div>
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(signups.thisWeek)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  this week
                </div>
              </div>
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(signups.today)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  today
                </div>
              </div>
            </div>
          </div>
          <div className="h-4" />
          <div className="paper pb-0 p-6">
            <div className="text text-lg">Signups</div>
            <div className="text text-disabled text-sm pb-4">this month</div>
            {createBarChart(signupData)}
          </div>
        </div>
        <div className="flex-1">
          <div className="paper py-5 px-6">
            <div className="text text-lg text-dim mb-6">Total Logins</div>
            <div className="flex flex-row gap-2">
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(logins.thisMonth)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  this month
                </div>
              </div>
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(logins.thisWeek)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  this week
                </div>
              </div>
              <div className="flex-1">
                <div className="text text-4xl text-center">
                  {formatNumber(logins.today)}
                </div>
                <div className="text text-disabled text-sm text-center">
                  today
                </div>
              </div>
            </div>
          </div>
          <div className="h-4" />
          <div className="paper pb-0 p-6">
            <div className="text text-lg">Logins</div>
            <div className="text text-disabled text-sm pb-4">this month</div>
            {createBarChart(loginData)}
          </div>
        </div>
      </div>
      <div className="h-4" />
    </>
  );
}
