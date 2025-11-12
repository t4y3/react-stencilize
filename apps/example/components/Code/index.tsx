'use client';

import {use} from "react";

export const Code = ({code}: { code: Promise<string> }) => {
  const html = use(code);
  return <>
    <div dangerouslySetInnerHTML={{__html: html}}/>
  </>
}
