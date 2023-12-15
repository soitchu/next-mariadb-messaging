import React, { useRef } from "react";
import {
  averageMessageAt,
  getLongestMessages,
  getMostActiveHours,
  getMostActiveUser
} from "../api/analytics";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import styles from "../styles/Analytics.module.css";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const getServerSideProps = async (context) => {
  const [data, activeUserData, longestMessages] = await Promise.all([
    getMostActiveHours(),
    getMostActiveUser(),
    getLongestMessages()
  ]);

  return {
    props: {
      longestMessages,
      hourData: {
        labels: data.map((x) => x.hour),
        datasets: [
          {
            data: data.map((x) => x.count),
            backgroundColor: "rgba(255, 255, 255, 1)"
          }
        ],
        borderWidth: 1
      },
      activeUserData: {
        labels: activeUserData.map((x) => x.username),
        datasets: [
          {
            data: activeUserData.map((x) => x.count),
            backgroundColor: "rgba(255, 255, 255, 1)"
          }
        ],
        borderWidth: 1
      }
    }
  };
};

function getOption(xLabel: string, yLabel: string, title: string) {
  return {
    responsive: false,
    scales: {
      y: {
        title: {
          display: true,
          text: yLabel
        }
      },
      x: {
        title: {
          display: true,
          text: xLabel
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: title
      },
      legend: {
        display: false
      }
    }
  };
}

export default function Analytics(props) {
  console.log(props.chartData);
  let count = 0;

  return (
    <div style={{ textAlign: "center" }}>
      <Bar
        className={styles.chart}
        width={600}
        height={300}
        data={{ ...props.hourData }}
        options={getOption("Hour", "Number of messages", "Number of messages / hour")}
      />
      <Bar
        className={styles.chart}
        width={600}
        height={300}
        data={{ ...props.activeUserData, xLabels: "Hour", yLabels: ["e"] }}
        options={getOption("Username", "Number of messages", "Number of messages / user")}
      />

      <div style={{ textAlign: "center", marginBottom: "20px" }}>Longest messages:</div>
      {props.longestMessages.map((x) => {
        return (
          <div className={styles.card} key={++count}>
            <div
              className={styles.cardText}
              onClick={function (event) {
                console.log(event);
                console.log((event.target as HTMLElement).classList.toggle(styles.expand));
              }}
            >
              <div className={styles.username}>
                {x.username} <br />
                Length: {x.message.length}
              </div>
              {x.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
