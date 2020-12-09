CREATE OR REPLACE PACKAGE DDLER
is
   function getddl ( p_owner in varchar2, p_type in varchar2, p_name in varchar2 ) return clob;
end DDLER;
/