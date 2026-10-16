"use client";
import {Lightbulb} from "lucide-react";
import {gameGuides} from "../lib/game-guides";
export function RuleBook({game}:{game:string}){const guide=gameGuides[game];if(!guide)return null;return <div className="rule-content"><strong>{guide.goal}</strong><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="rule-controls"><strong>Controls</strong><p>{guide.controls}</p></div><p className="rule-tip"><Lightbulb size={16}/>{guide.tip}</p></div>;}
