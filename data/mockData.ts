// Function to generate normally distributed random numbers (Box-Muller transform)
const randomNormal = (mean = 0, stdDev = 1) => {
  let u1 = 0,
    u2 = 0;
  while (u1 === 0) u1 = Math.random(); //Converting [0,1) to (0,1)
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
};

// Function to generate Pareto distributed random numbers
const randomPareto = (alpha = 3) => {
  return 1 / Math.pow(Math.random(), 1 / alpha);
};

// Function to generate Poisson distributed random numbers
const randomPoisson = (lambda = 5) => {
  let l = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > l);
  return k - 1;
};

export const generateMockData = (
  distributionName: string,
  count = 500
): Array<Record<string, string | number>> => {
  switch (distributionName.split(' ')[0]) {
    case '正态分布':
      return Array.from({ length: count }, (_, i) => ({
        customerId: `C${1001 + i}`,
        age: Math.round(randomNormal(32, 5)),
        procedureDurationMinutes: Math.round(randomNormal(45, 8)),
        satisfactionScore: parseFloat(Math.min(5, Math.max(1, randomNormal(4.2, 0.5))).toFixed(1)),
      }));

    case '帕累托分布': {
      const data = Array.from({ length: count }, (_, i) => ({
        customerId: `V${2001 + i}`,
        annualSpend: Math.round(randomPareto(1.16) * 1000) + 500,
      }));
      return data.sort((a, b) => b.annualSpend - a.annualSpend);
    }

    case '泊松分布':
      return Array.from({ length: count }, (_, i) => ({
        day: `Day ${i + 1}`,
        phoneInquiries: randomPoisson(8),
        onlineBookings: randomPoisson(5),
      }));

    case '对数正态分布':
      return Array.from({ length: count }, (_, i) => ({
        transactionId: `T${3001 + i}`,
        spendAmount: Math.round(Math.exp(randomNormal(8, 0.8))),
      }));

    case '线性回归':
      return Array.from({ length: count }, (_, i) => {
        const adSpend = (i + 1) * 100;
        const newCustomers = Math.round(adSpend * 0.2 + randomNormal(0, 15));
        return {
          month: i + 1,
          adSpend,
          newCustomers: Math.max(0, newCustomers),
        };
      });

    case 'K-均值聚类': {
      const clusters = [];
      for (let i = 0; i < count; i++) {
        const type = Math.random();
        if (type < 0.3) {
          // High value
          clusters.push({
            customerId: `K${4001 + i}`,
            frequency: Math.round(randomNormal(10, 2)),
            monetary: Math.round(randomNormal(15000, 3000)),
          });
        } else if (type < 0.7) {
          // Potential
          clusters.push({
            customerId: `K${4001 + i}`,
            frequency: Math.round(randomNormal(4, 1)),
            monetary: Math.round(randomNormal(5000, 1500)),
          });
        } else {
          // Low value
          clusters.push({
            customerId: `K${4001 + i}`,
            frequency: Math.round(randomNormal(1.5, 0.5)),
            monetary: Math.round(randomNormal(1000, 500)),
          });
        }
      }
      return clusters;
    }

    case '联合分析': {
      const scenarios = [
        {
          scenario: 1,
          brand: 'A',
          price: 10000,
          duration: '6 months',
          doctor_exp: '5 years',
          utility: 4.5,
        },
        {
          scenario: 2,
          brand: 'B',
          price: 10000,
          duration: '12 months',
          doctor_exp: '5 years',
          utility: 5.2,
        },
        {
          scenario: 3,
          brand: 'A',
          price: 15000,
          duration: '12 months',
          doctor_exp: '10 years',
          utility: 6.1,
        },
        {
          scenario: 4,
          brand: 'B',
          price: 15000,
          duration: '6 months',
          doctor_exp: '10 years',
          utility: 4.8,
        },
      ];
      return scenarios.flatMap((s) =>
        Array.from({ length: Math.floor(count / 4) }, (_, i) => ({
          ...s,
          customerId: `CJ${1001 + i}`,
          choice: Math.random() < s.utility / 10 ? 1 : 0,
        }))
      );
    }

    case '主成分分析':
      return Array.from({ length: count }, (_, i) => {
        const q1 = randomNormal(4, 1);
        const q2 = randomNormal(3, 1);
        const q3 = randomNormal(4.5, 0.8);
        const q4 = randomNormal(4.2, 1.2);
        return {
          customerId: `PCA${2001 + i}`,
          q1_service: parseFloat(q1.toFixed(1)),
          q2_price: parseFloat(q2.toFixed(1)),
          q3_effect: parseFloat(q3.toFixed(1)),
          q4_brand: parseFloat(q4.toFixed(1)),
          pc1_service_price: parseFloat((0.6 * q1 + 0.4 * q2).toFixed(2)),
          pc2_effect_brand: parseFloat((0.7 * q3 + 0.3 * q4).toFixed(2)),
        };
      });

    case '支持向量机':
      return Array.from({ length: count }, (_, i) => {
        const isVip = Math.random() > 0.5;
        return {
          customerId: `SVM${3001 + i}`,
          frequency: parseFloat((isVip ? randomNormal(7, 1) : randomNormal(3, 1)).toFixed(1)),
          avg_spend: Math.round(isVip ? randomNormal(7000, 1000) : randomNormal(3000, 1000)),
          is_vip: isVip ? 1 : 0,
        };
      });

    case '增益模型':
      return Array.from({ length: count }, (_, i) => {
        const typeRoll = Math.random();
        let segment = '';
        if (typeRoll < 0.2)
          segment = 'Persuadable'; // 20%
        else if (typeRoll < 0.6)
          segment = 'Sure Thing'; // 40%
        else if (typeRoll < 0.9)
          segment = 'Lost Cause'; // 30%
        else segment = 'Sleeping Dog'; // 10%
        const in_test_group = Math.random() > 0.5 ? 1 : 0;
        let converted = 0;
        if (segment === 'Sure Thing') converted = 1;
        if (segment === 'Persuadable' && in_test_group) converted = 1;
        if (segment === 'Sleeping Dog' && in_test_group) converted = -1; // Represents negative effect
        return { customerId: `UPL${4001 + i}`, segment, in_test_group, converted };
      });

    case 'Cox比例风险模型':
      return Array.from({ length: count }, (_, i) => {
        const high_risk = Math.random() > 0.7;
        return {
          customerId: `COX${5001 + i}`,
          time_to_churn_months: Math.round(high_risk ? randomNormal(6, 2) : randomNormal(12, 4)),
          is_churned: 1,
          age: Math.round(randomNormal(35, 8)),
          discount_usage_rate: parseFloat(
            (high_risk ? randomNormal(0.1, 0.05) : randomNormal(0.4, 0.1)).toFixed(2)
          ),
        };
      });

    default:
      return [];
  }
};

export const convertToCSV = (data: Array<Record<string, string | number>>): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => JSON.stringify(obj[header], (_, value) => (value === null ? '' : value)))
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};
