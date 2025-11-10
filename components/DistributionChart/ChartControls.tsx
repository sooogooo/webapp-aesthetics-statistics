import React from 'react';

interface NormalParams {
  mu: number;
  sigma: number;
}

interface BetaParams {
  alpha: number;
  beta: number;
}

interface ChartControlsProps {
  distributionId: number;
  normalParams: NormalParams;
  setNormalParams: React.Dispatch<React.SetStateAction<NormalParams>>;
  poissonLambda: number;
  setPoissonLambda: React.Dispatch<React.SetStateAction<number>>;
  betaParams: BetaParams;
  setBetaParams: React.Dispatch<React.SetStateAction<BetaParams>>;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  distributionId,
  normalParams,
  setNormalParams,
  poissonLambda,
  setPoissonLambda,
  betaParams,
  setBetaParams,
}) => {
  const interactiveModels = [1, 3, 9];

  if (!interactiveModels.includes(distributionId)) {
    return null;
  }

  let sliders = null;

  if (distributionId === 1) {
    // Normal Distribution
    sliders = (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-xs">
          <label className="font-medium">
            均值 μ:{' '}
            <span className="font-bold text-[color:rgb(var(--color-primary))]">
              {normalParams.mu.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={normalParams.mu}
            onChange={(e) => setNormalParams((p) => ({ ...p, mu: +e.target.value }))}
            className="w-full"
          />
        </div>
        <div className="text-xs">
          <label className="font-medium">
            标准差 σ:{' '}
            <span className="font-bold text-[color:rgb(var(--color-primary))]">
              {normalParams.sigma.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={normalParams.sigma}
            onChange={(e) => setNormalParams((p) => ({ ...p, sigma: +e.target.value }))}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (distributionId === 3) {
    // Poisson Distribution
    sliders = (
      <div className="text-xs">
        <label className="font-medium">
          平均发生率 λ:{' '}
          <span className="font-bold text-[color:rgb(var(--color-primary))]">
            {poissonLambda.toFixed(1)}
          </span>
        </label>
        <input
          type="range"
          min="0.5"
          max="15"
          step="0.5"
          value={poissonLambda}
          onChange={(e) => setPoissonLambda(+e.target.value)}
          className="w-full"
        />
      </div>
    );
  }

  if (distributionId === 9) {
    // Beta Distribution
    sliders = (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-xs">
          <label className="font-medium">
            α (成功+1):{' '}
            <span className="font-bold text-[color:rgb(var(--color-primary))]">
              {betaParams.alpha.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={betaParams.alpha}
            onChange={(e) => setBetaParams((p) => ({ ...p, alpha: +e.target.value }))}
            className="w-full"
          />
        </div>
        <div className="text-xs">
          <label className="font-medium">
            β (失败+1):{' '}
            <span className="font-bold text-[color:rgb(var(--color-primary))]">
              {betaParams.beta.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={betaParams.beta}
            onChange={(e) => setBetaParams((p) => ({ ...p, beta: +e.target.value }))}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <h3 className="text-center font-bold text-slate-700 mb-2">参数实时模拟</h3>
      <div className="bg-slate-50/50 p-4 rounded-lg">{sliders}</div>
    </div>
  );
};

export default ChartControls;
