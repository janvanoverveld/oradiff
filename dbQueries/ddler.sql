CREATE OR REPLACE PACKAGE DDLER
is
   function getddl ( p_owner in varchar2
   ,                 p_type  in varchar2
   ,                 p_name  in varchar2 ) return clob;
   procedure getddl ( p_owner    in  varchar2
   ,                  p_type     in  varchar2
   ,                  p_name     in  varchar2
   ,                  p_filename out varchar2
   ,                  p_ddl      out clob );
end DDLER;
/

CREATE OR REPLACE PACKAGE BODY DDLER
is
   procedure initialize_dbms_metadata
   is
   begin
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'SQLTERMINATOR', true);
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'PRETTY', true);
      --
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'SEGMENT_ATTRIBUTES', false);
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'STORAGE', false);
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'TABLESPACE', false);
      dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'CONSTRAINTS_AS_ALTER', true);
      --dbms_metadata.set_transform_param(dbms_metadata.session_transform, 'DEFAULT', true);
   end initialize_dbms_metadata;

   procedure prettyfi(p_dll in out nocopy clob)
   is
   begin
      p_dll := trim(leading chr(10) from p_dll);
      p_dll := trim(leading chr(13) from p_dll);
      p_dll := trim(p_dll);
   end prettyfi;

   function getddl ( p_owner in varchar2, p_type in varchar2, p_name in varchar2 ) return clob
   is
      l_ddl clob;
      l_type varchar2(1000);
   begin
      l_type := case p_type when 'PACKAGE'      then 'PACKAGE_SPEC'
                            when 'PACKAGE BODY' then 'PACKAGE_BODY'
                            else p_type end;
      initialize_dbms_metadata();
      l_ddl := DBMS_METADATA.get_ddl ( object_type => l_type
               ,                       name        => p_name
               ,                       schema      => p_owner
               ,                       transform   => 'DDL');
      prettyfi(l_ddl);
      return l_ddl;
   end getddl;
   procedure getddl ( p_owner    in  varchar2
   ,                  p_type     in  varchar2
   ,                  p_name     in  varchar2
   ,                  p_filename out varchar2
   ,                  p_ddl      out clob )
   is
      l_extensie varchar2(3);
   begin
      l_extensie := case p_type
                       when 'TABLE'        then 'tab'
                       when 'VIEW'         then 'vw'
                       when 'TYPE'         then 'tps'
                       when 'TYPE BODY'    then 'tpb'
                       when 'SEQUENCE'     then 'seq'
                       when 'PROCEDURE'    then 'prc'
                       when 'INDEX'        then 'idx'
                       when 'TRIGGER'      then 'trg'
                       when 'FUNCTION'     then 'fnc'
                       when 'SYNONYM'      then 'syn'
                       when 'PACKAGE'      then 'pks'
                       when 'PACKAGE BODY' then 'pkb'
                    end;

      p_filename := lower(p_owner || '.' || p_name  || '.' ||  l_extensie);
      p_ddl := getddl ( p_owner => p_owner
               ,        p_type  => p_type
               ,        p_name  => p_name );
   end getddl;
end DDLER;
/