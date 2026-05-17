"use client";

import { useEffect, useState } from "react";

type Match = {
  court: number;
  team1: string[];
  team2: string[];
  rest: string[];
};

type CandidateMatch = {
  team1: string[];
  team2: string[];
  players: string[];
};

export default function Home() {
  const [menCount, setMenCount] = useState(4);
  const [womenCount, setWomenCount] = useState(4);
  const [courtCount, setCourtCount] = useState(2);
  const [matchCount, setMatchCount] = useState(4);

  const [menNames, setMenNames] = useState<string[]>([]);
  const [womenNames, setWomenNames] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[][]>([]);

  useEffect(() => {
    setMenNames((prev) =>
      Array.from({ length: menCount }, (_, i) => prev[i] ?? `男性${i + 1}`)
    );
    setWomenNames((prev) =>
      Array.from({ length: womenCount }, (_, i) => prev[i] ?? `女性${i + 1}`)
    );
  }, [menCount, womenCount]);

  const pairKey = (a: string, b: string) => `${a}__${b}`;

  const generateSchedule = () => {
    const men = menNames.filter((name) => name.trim() !== "");
    const women = womenNames.filter((name) => name.trim() !== "");

    const pairCount = new Map<string, number>();
    const playCount = new Map<string, number>();

    [...men, ...women].forEach((p) => playCount.set(p, 0));

    const rounds: Match[][] = [];

    for (let roundIndex = 0; roundIndex < matchCount; roundIndex++) {
      const candidates: CandidateMatch[] = [];

      for (const m1 of men) {
        for (const w1 of women) {
          for (const m2 of men) {
            for (const w2 of women) {
              if (m1 === m2) continue;
              if (w1 === w2) continue;

              candidates.push({
                team1: [m1, w1],
                team2: [m2, w2],
                players: [m1, w1, m2, w2],
              });
            }
          }
        }
      }

      candidates.sort((a, b) => {
        const scoreA = calcMatchScore(a, pairCount, playCount);
        const scoreB = calcMatchScore(b, pairCount, playCount);
        return scoreA - scoreB;
      });

      const selected: CandidateMatch[] = [];
      const usedThisRound = new Set<string>();

      for (const candidate of candidates) {
        if (selected.length >= courtCount) break;

        const hasUsedPlayer = candidate.players.some((p) =>
          usedThisRound.has(p)
        );

        if (hasUsedPlayer) continue;

        selected.push(candidate);
        candidate.players.forEach((p) => usedThisRound.add(p));
      }

      const rest = [...men, ...women].filter((p) => !usedThisRound.has(p));

      const roundMatches: Match[] = selected.map((match, index) => ({
        court: index + 1,
        team1: match.team1,
        team2: match.team2,
        rest,
      }));

      selected.forEach((match) => {
        const key1 = pairKey(match.team1[0], match.team1[1]);
        const key2 = pairKey(match.team2[0], match.team2[1]);

        pairCount.set(key1, (pairCount.get(key1) ?? 0) + 1);
        pairCount.set(key2, (pairCount.get(key2) ?? 0) + 1);

        match.players.forEach((p) => {
          playCount.set(p, (playCount.get(p) ?? 0) + 1);
        });
      });

      rounds.push(roundMatches);
    }

    setMatches(rounds);
  };

  const calcMatchScore = (
    match: CandidateMatch,
    pairCount: Map<string, number>,
    playCount: Map<string, number>
  ) => {
    const [m1, w1] = match.team1;
    const [m2, w2] = match.team2;

    const pairScore =
      (pairCount.get(pairKey(m1, w1)) ?? 0) * 100 +
      (pairCount.get(pairKey(m2, w2)) ?? 0) * 100;

    const playScore = match.players.reduce(
      (sum, player) => sum + (playCount.get(player) ?? 0),
      0
    );

    return pairScore + playScore;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-5">
      <div className="mx-auto max-w-md">
        <header className="mb-5 text-center">
          <div className="mb-2 text-4xl">🎾</div>
          <h1 className="text-2xl font-black text-gray-900">
            ミックス乱数表
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            男女ペアの試合表をかんたん作成
          </p>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-lg">
          <h2 className="mb-4 text-lg font-bold">条件入力</h2>

          <div className="grid grid-cols-2 gap-3">
            <InputBox label="男性" value={menCount} setValue={setMenCount} />
            <InputBox label="女性" value={womenCount} setValue={setWomenCount} />
            <InputBox
              label="コート"
              value={courtCount}
              setValue={setCourtCount}
              min={1}
            />
            <InputBox
              label="試合数"
              value={matchCount}
              setValue={setMatchCount}
              min={1}
            />
          </div>

          <MemberInputs
            title="男性メンバー"
            color="blue"
            names={menNames}
            setNames={setMenNames}
          />

          <MemberInputs
            title="女性メンバー"
            color="pink"
            names={womenNames}
            setNames={setWomenNames}
          />

          <button
            onClick={generateSchedule}
            className="mt-6 w-full rounded-2xl bg-emerald-500 py-4 text-lg font-black text-white shadow-md active:scale-95"
          >
            乱数表を作成する
          </button>
        </section>

        <section className="space-y-4">
          {matches.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              条件を入力して作成ボタンを押してください
            </div>
          )}

          {matches.map((round, roundIndex) => (
            <div key={roundIndex} className="rounded-3xl bg-white p-5 shadow-lg">
              <h2 className="mb-4 text-xl font-black text-gray-900">
                第{roundIndex + 1}試合
              </h2>

              <div className="space-y-3">
                {round.map((match) => (
                  <div key={match.court} className="rounded-2xl border p-4">
                    <div className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
                      コート {match.court}
                    </div>

                    <div className="space-y-3">
                      <TeamCard color="blue" players={match.team1} />
                      <div className="text-center text-sm font-black text-gray-400">
                        VS
                      </div>
                      <TeamCard color="pink" players={match.team2} />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 font-bold">休憩</div>
                  <div className="flex flex-wrap gap-2">
                    {round[0]?.rest.length > 0 ? (
                      round[0].rest.map((player) => (
                        <span
                          key={player}
                          className="rounded-full bg-white px-3 py-1 text-sm shadow-sm"
                        >
                          {player}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">休憩者なし</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function InputBox({
  label,
  value,
  setValue,
  min = 0,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
}) {
  return (
    <label className="rounded-2xl bg-gray-50 p-3">
      <div className="mb-1 text-sm font-bold text-gray-500">{label}</div>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full bg-transparent text-2xl font-black outline-none"
      />
    </label>
  );
}

function MemberInputs({
  title,
  color,
  names,
  setNames,
}: {
  title: string;
  color: "blue" | "pink";
  names: string[];
  setNames: (names: string[]) => void;
}) {
  const titleColor = color === "blue" ? "text-blue-700" : "text-pink-700";
  const inputColor =
    color === "blue"
      ? "border-blue-100 bg-blue-50 focus:border-blue-400"
      : "border-pink-100 bg-pink-50 focus:border-pink-400";

  return (
    <div className="mt-5">
      <h3 className={`mb-2 font-bold ${titleColor}`}>{title}</h3>
      <div className="grid gap-2">
        {names.map((name, index) => (
          <input
            key={index}
            value={name}
            onChange={(e) => {
              const updated = [...names];
              updated[index] = e.target.value;
              setNames(updated);
            }}
            className={`rounded-2xl border px-4 py-3 text-base outline-none ${inputColor}`}
          />
        ))}
      </div>
    </div>
  );
}

function TeamCard({
  players,
  color,
}: {
  players: string[];
  color: "blue" | "pink";
}) {
  const colorClass =
    color === "blue"
      ? "bg-blue-50 border-blue-100 text-blue-900"
      : "bg-pink-50 border-pink-100 text-pink-900";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-center font-bold ${colorClass}`}
    >
      {players[0]}　&　{players[1]}
    </div>
  );
}